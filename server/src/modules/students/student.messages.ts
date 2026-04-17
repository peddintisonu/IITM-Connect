export const studentErrorMessages = {
    usernameRequired: "Username is required",
    noImageProvided: "No image provided",
    studentNotFound: "Student not found",
    studentAlreadyOnboarded: "Student already onboarded",
    usernameAlreadyTaken: "Username already taken",
    roomNoRequiredIfHostelSelected:
        "Room number is required if hostel is selected",
    hostelRequiredIfRoomProvided:
        "Hostel is required if room number is provided",
    profilePhotoTooLarge: "Profile photo must be under",
    coverPhotoTooLarge: "Cover photo must be under",
} as const;

export const studentRouteMessages = {
    onboardingComplete: "Onboarding complete",
    currentUserFetched: "Current user fetched",
    profileUpdated: "Profile updated",
    hostelUpdated: "Hostel updated",
    privacySettingsUpdated: "Privacy settings updated",
    profileFetched: "Profile fetched",
    profilePhotoUpdated: "Profile photo updated",
    coverPhotoUpdated: "Cover photo updated",
} as const;
