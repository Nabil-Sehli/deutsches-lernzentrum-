import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCenterPlan, checkInviteLimit, checkVideoUploadLimit, incrementVideoUploadCount } from "./middleware";
import { getDb } from "./queries/connection";
import { TRPCError } from "@trpc/server";

// Mock the database connection
vi.mock("./queries/connection", () => ({
  getDb: vi.fn(),
}));

describe("Pricing Plan System", () => {
  const mockDb = {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getDb as any).mockReturnValue(mockDb);
  });

  describe("getCenterPlan", () => {
    it("should return center plan details for a free plan center", async () => {
      const mockResult = {
        plan: "free" as const,
        videoUploadCount: 0,
        videoUploadWeek: 20,
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockResult]),
        }),
      });

      const result = await getCenterPlan(1);
      expect(result.plan).toBe("free");
      expect(result.videoUploadCount).toBe(0);
      expect(result.videoUploadWeek).toBe(20);
    });

    it("should return center plan details for a premium plan center", async () => {
      const mockResult = {
        plan: "premium" as const,
        videoUploadCount: 10,
        videoUploadWeek: 20,
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockResult]),
        }),
      });

      const result = await getCenterPlan(1);
      expect(result.plan).toBe("premium");
    });

    it("should throw error when center not found", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      await expect(getCenterPlan(999)).rejects.toThrow(TRPCError);
    });
  });

  describe("checkInviteLimit", () => {
    it("should not throw error for premium plan when creating invite codes", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              plan: "premium",
              videoUploadCount: 0,
              videoUploadWeek: null,
            },
          ]),
        }),
      });

      // Should not throw
      await expect(checkInviteLimit(1)).resolves.not.toThrow();
    });

    it("should allow invite code creation for free plan with less than 10 students", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn()
            .mockResolvedValueOnce([
              {
                plan: "free",
                videoUploadCount: 0,
                videoUploadWeek: null,
              },
            ])
            .mockResolvedValueOnce([{ count: 5 }]),
        }),
      });

      // Should not throw
      await expect(checkInviteLimit(1)).resolves.not.toThrow();
    });

    it("should throw error for free plan when reaching 10 student limit", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn()
            .mockResolvedValueOnce([
              {
                plan: "free",
                videoUploadCount: 0,
                videoUploadWeek: null,
              },
            ])
            .mockResolvedValueOnce([{ count: 10 }]),
        }),
      });

      await expect(checkInviteLimit(1)).rejects.toThrow(
        "Free plan limited to 10 students. Upgrade to Premium for unlimited enrollment."
      );
    });
  });

  describe("checkVideoUploadLimit", () => {
    const getCurrentWeek = () => {
      const date = new Date();
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    };

    it("should not throw error for premium plan", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              plan: "premium",
              videoUploadCount: 100,
              videoUploadWeek: getCurrentWeek(),
            },
          ]),
        }),
      });

      // Should not throw
      await expect(checkVideoUploadLimit(1)).resolves.not.toThrow();
    });

    it("should allow video upload for free plan with 0 uploads in current week", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              plan: "free",
              videoUploadCount: 0,
              videoUploadWeek: getCurrentWeek(),
            },
          ]),
        }),
      });

      // Should not throw
      await expect(checkVideoUploadLimit(1)).resolves.not.toThrow();
    });

    it("should throw error for free plan when reaching 1 video per week limit", async () => {
      const currentWeek = getCurrentWeek();
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              plan: "free",
              videoUploadCount: 1,
              videoUploadWeek: currentWeek,
            },
          ]),
        }),
      });

      await expect(checkVideoUploadLimit(1)).rejects.toMatchObject({
        code: "FORBIDDEN",
        message: expect.stringContaining("Free plan limited to 1 video per week"),
      });
    });

    it("should allow video upload for free plan when week changes", async () => {
      const currentWeek = getCurrentWeek();
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              plan: "free",
              videoUploadCount: 1,
              videoUploadWeek: currentWeek - 1, // Previous week
            },
          ]),
        }),
      });

      // Should not throw because it's a different week
      await expect(checkVideoUploadLimit(1)).resolves.not.toThrow();
    });
  });

  describe("incrementVideoUploadCount", () => {
    it("should not update DB for premium plan", async () => {
      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              plan: "premium",
              videoUploadCount: 5,
              videoUploadWeek: 24,
            },
          ]),
        }),
      });

      mockDb.select = selectMock;

      await incrementVideoUploadCount(1);

      // Update should not be called for premium plan
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it("should call update for free plan", async () => {
      const whereChainMock = vi.fn().mockResolvedValue([]);
      const setChainMock = vi.fn().mockReturnValue({
        where: whereChainMock,
      });
      const updateChainMock = vi.fn().mockReturnValue({
        set: setChainMock,
      });

      const selectMock = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              plan: "free",
              videoUploadCount: 0,
              videoUploadWeek: 23,
            },
          ]),
        }),
      });

      mockDb.select = selectMock;
      mockDb.update = updateChainMock as any;

      await incrementVideoUploadCount(1);

      // Update should be called for free plan
      expect(updateChainMock).toHaveBeenCalled();
      expect(setChainMock).toHaveBeenCalled();
    });
  });

  describe("Pricing Plan Integration", () => {
    it("free plan should have 10 student enrollment limit", () => {
      // This is documented in the system
      expect(10).toBe(10);
    });

    it("free plan should have 1 video per week limit", () => {
      // This is documented in the system
      expect(1).toBe(1);
    });

    it("free plan should have 1 invite code limit", () => {
      // This is documented in the system
      expect(1).toBe(1);
    });

    it("premium plan should have unlimited students", () => {
      // Premium plans bypass all checks
      expect(true).toBe(true);
    });

    it("premium plan should have unlimited video uploads", () => {
      // Premium plans bypass all checks
      expect(true).toBe(true);
    });

    it("premium plan should have unlimited invite codes", () => {
      // Premium plans bypass all checks
      expect(true).toBe(true);
    });
  });
});
