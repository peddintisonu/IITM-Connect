import mongoose, { Schema } from "mongoose";

export interface IRollNoHistory {
    rollNo: string;
    deptId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    batch: number;
}

export interface IHostelHistory {
    hostelId: mongoose.Types.ObjectId;
    roomNo: number;
}

export interface ILink {
    label: string;
    url: string;
}

export interface IStudent extends mongoose.Document {
    fullName: string;
    email: string;
    displayName?: string;
    username?: string;
    profilePhoto?: string;
    coverPhoto?: string;
    profilePhotoPublicId?: string;
    coverPhotoPublicId?: string;
    bio?: string;
    links: ILink[];
    interests: string[];
    skills: string[];
    currentRollNo?: string;
    currentDeptId?: mongoose.Types.ObjectId;
    currentCourseId?: mongoose.Types.ObjectId;
    currentBatch?: number;
    graduationYear?: number;
    currentHostelId?: mongoose.Types.ObjectId;
    currentRoomNo?: number;
    rollNoHistory: IRollNoHistory[];
    hostelHistory: IHostelHistory[];
    status: "active" | "inactive" | "suspended";
    isOnboarded: boolean;
    tokenVersion: number;
    accountType: "public" | "private";
    privacySettings: {
        hiddenFields: string[];
    };
    incrementTokenVersion: () => Promise<void>;
}

const rollNoHistorySchema = new Schema<IRollNoHistory>(
    {
        rollNo: { type: String, required: true },
        deptId: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        batch: { type: Number, required: true },
    },
    { _id: false }
);

const hostelHistorySchema = new Schema<IHostelHistory>(
    {
        hostelId: {
            type: Schema.Types.ObjectId,
            ref: "Hostel",
            required: true,
        },
        roomNo: { type: Number, required: true },
    },
    { _id: false }
);

const linkSchema = new Schema<ILink>(
    {
        label: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const privacySettingsSchema = new Schema(
    {
        hiddenFields: {
            type: [String],
            default: ["roomNo"],
        },
    },
    { _id: false }
);

const studentSchema = new mongoose.Schema<IStudent>(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        displayName: { type: String, trim: true },
        username: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            lowercase: true,
        },
        profilePhoto: { type: String },
        coverPhoto: { type: String },
        profilePhotoPublicId: { type: String },
        coverPhotoPublicId: { type: String },
        bio: { type: String, trim: true },
        links: { type: [linkSchema], default: [] },
        interests: { type: [String], default: [] },
        skills: { type: [String], default: [] },
        accountType: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },
        privacySettings: { type: privacySettingsSchema, default: () => ({}) },
        currentRollNo: { type: String },
        currentDeptId: { type: Schema.Types.ObjectId, ref: "Department" },
        currentCourseId: { type: Schema.Types.ObjectId, ref: "Course" },
        currentBatch: { type: Number },
        graduationYear: { type: Number },
        currentHostelId: { type: Schema.Types.ObjectId, ref: "Hostel" },
        currentRoomNo: { type: Number },
        rollNoHistory: { type: [rollNoHistorySchema], default: [] },
        hostelHistory: { type: [hostelHistorySchema], default: [] },
        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
        },
        isOnboarded: { type: Boolean, default: false },
        tokenVersion: { type: Number, default: 0 },
    },
    { timestamps: true }
);

studentSchema.index({ status: 1, isOnboarded: 1, username: 1, _id: 1 });
studentSchema.index({ status: 1, isOnboarded: 1, displayName: 1, _id: 1 });
studentSchema.index({ status: 1, isOnboarded: 1, currentDeptId: 1, _id: 1 });
studentSchema.index({ status: 1, isOnboarded: 1, currentHostelId: 1, _id: 1 });
studentSchema.index({ status: 1, isOnboarded: 1, currentCourseId: 1, _id: 1 });
studentSchema.index({ status: 1, isOnboarded: 1, currentBatch: 1, _id: 1 });

studentSchema.methods.incrementTokenVersion = async function () {
    this.tokenVersion += 1;
    await this.save();
};

studentSchema.pre("save", function () {
    if (this.isModified("accountType")) {
        const isPrivate = this.accountType === "private";
        this.privacySettings.hiddenFields = isPrivate
            ? ["rollNo", "hostel", "roomNo"]
            : ["roomNo"];
    }
});

const Student = mongoose.model<IStudent>("Student", studentSchema);

export default Student;
