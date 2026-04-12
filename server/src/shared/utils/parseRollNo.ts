export function parseRollNo(smail: string) {
    const regex = /^([a-zA-Z]+)(\d+)([a-zA-Z]+)(\d+)$/;
    const prefix = smail.split("@")[0];
    const match = prefix.match(regex);
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
    const parts = fullName.trim().split(" ");
    const lastPart = parts[parts.length - 1];
    const isRollNo = /^[a-zA-Z]+\d+[a-zA-Z]+\d+$/.test(lastPart);
    return isRollNo ? parts.slice(0, -1).join(" ") : fullName.trim();
}
