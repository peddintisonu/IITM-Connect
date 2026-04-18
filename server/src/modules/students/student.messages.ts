export const studentErrorMessages = {
    usernameRequired: "Username is required",
    invalidSearchCursor: "Invalid search cursor",
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
    invalidUserIdFormat: "Invalid user ID format",
} as const;

export const studentRouteMessages = {
    onboardingComplete: "Onboarding complete",
    usernameAvailabilityFetched: "Username availability fetched",
    currentUserFetched: "Current user fetched",
    profileUpdated: "Profile updated",
    hostelUpdated: "Hostel updated",
    privacySettingsUpdated: "Privacy settings updated",
    profileFetched: "Profile fetched",
    cardsFetched: "Student cards fetched",
    searchFetched: "Student search fetched",
    profilePhotoUpdated: "Profile photo updated",
    coverPhotoUpdated: "Cover photo updated",
} as const;
