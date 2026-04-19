import { z } from "zod";
import { SOCIAL_LIST_LIMITS } from "../modules/social/social.constants";

export const socialListPaginationSchema = z.object({
    limit: z.coerce
        .number()
        .int()
        .min(SOCIAL_LIST_LIMITS.min)
        .max(SOCIAL_LIST_LIMITS.max)
        .default(SOCIAL_LIST_LIMITS.default),
    cursor: z.string().trim().optional(),
});

export type SocialListPaginationInput = z.infer<
    typeof socialListPaginationSchema
>;
