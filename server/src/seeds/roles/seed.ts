import Student, {
    STUDENT_ROLE,
    StudentRole,
} from "../../modules/students/student.model";

export type RoleAssignments = Record<string, StudentRole>;

export const seedRoles = async (assignments: RoleAssignments) => {
    const normalizedEntries = Object.entries(assignments).map(
        ([email, role]) => [email.trim().toLowerCase(), role] as const
    );

    for (const [email, role] of normalizedEntries) {
        const updated = await Student.findOneAndUpdate(
            { email },
            { $set: { role } },
            { new: true }
        ).select("email role");

        if (!updated) {
            console.warn(`[roles] user not found for email: ${email}`);
            continue;
        }

        console.log(`[roles] ${email} -> ${updated.role}`);
    }
};

export const seedRolesFromEnv = async () => {
    const raw = process.env.SEED_ROLE_ASSIGNMENTS_JSON;

    if (!raw) {
        console.warn(
            "[roles] SEED_ROLE_ASSIGNMENTS_JSON not set; skipping role updates"
        );
        return;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error("SEED_ROLE_ASSIGNMENTS_JSON must be valid JSON");
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error(
            'SEED_ROLE_ASSIGNMENTS_JSON must be an object: { "email": "role" }'
        );
    }

    const validRoles = new Set<StudentRole>([
        STUDENT_ROLE.STUDENT,
        STUDENT_ROLE.ADMIN,
        STUDENT_ROLE.SUPER_ADMIN,
    ]);

    const assignments: RoleAssignments = {};

    for (const [email, role] of Object.entries(parsed)) {
        if (typeof role !== "string" || !validRoles.has(role as StudentRole)) {
            throw new Error(
                `Invalid role for ${email}. Allowed roles: student, admin, super_admin`
            );
        }

        assignments[email] = role as StudentRole;
    }

    await seedRoles(assignments);
};
