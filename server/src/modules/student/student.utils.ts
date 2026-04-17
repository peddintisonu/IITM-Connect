const ROLL_NO_REGEX = /^([A-Za-z]{2})(\d{2})([A-Za-z])(\d{3})$/;

export function parseRollNo(smail: string) {
    const prefix = smail.split("@")[0];
    const match = prefix.match(ROLL_NO_REGEX);
    if (!match) {
        throw new Error(`Invalid smail format: ${smail}`);
    }
    const deptCode = match[1].toUpperCase();
    const batch = parseInt(match[2], 10);
    const courseCode = match[3].toUpperCase();
    const rollNo = smail.split("@")[0].toLowerCase();
    return { deptCode, batch, courseCode, rollNo };
}

export function cleanFullName(fullName: string) {
    const trimmedName = fullName.trim();
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return trimmedName;
    }
    const lastPart = parts[parts.length - 1];
    const isRollNo = ROLL_NO_REGEX.test(lastPart);
    return isRollNo ? parts.slice(0, -1).join(" ") : trimmedName;
}
