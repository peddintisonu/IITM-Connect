# File Tree: IITM Connect

**Generated:** 4/27/2026, 3:21:17 PM
**Root Path:** `d:\Projects\Web-Projects\IITM Connect`

```
├── 📁 client
│   ├── 📁 docs
│   │   ├── 📝 Frontend_API_Integration_Guide.md
│   │   └── 📝 Frontend_Requirements.md
│   ├── 📁 public
│   │   ├── 🖼️ favicon.svg
│   │   └── 🖼️ icons.svg
│   ├── 📁 src
│   │   ├── 📁 assets
│   │   │   ├── 🖼️ hero.png
│   │   │   ├── 🖼️ react.svg
│   │   │   └── 🖼️ vite.svg
│   │   ├── 📁 components
│   │   │   ├── 📁 ui
│   │   │   │   ├── 📄 Button.tsx
│   │   │   │   └── 📄 ThemeToggle.tsx
│   │   │   ├── 📄 Navigation.tsx
│   │   │   └── 📄 ProtectedRoute.tsx
│   │   ├── 📁 config
│   │   │   └── 📄 env.ts
│   │   ├── 📁 context
│   │   │   └── 📄 AuthContext.tsx
│   │   ├── 📁 hooks
│   │   │   ├── 📄 useAuthSessions.ts
│   │   │   ├── 📄 useMasterData.ts
│   │   │   ├── 📄 useSocial.ts
│   │   │   ├── 📄 useStudent.ts
│   │   │   └── 📄 useTheme.ts
│   │   ├── 📁 lib
│   │   │   └── 📄 utils.ts
│   │   ├── 📁 pages
│   │   │   ├── 📄 FollowersPage.tsx
│   │   │   ├── 📄 HomePage.tsx
│   │   │   ├── 📄 LandingPage.tsx
│   │   │   ├── 📄 OnboardingPage.tsx
│   │   │   ├── 📄 ProfilePage.tsx
│   │   │   └── 📄 SettingsPage.tsx
│   │   ├── 📁 services
│   │   │   ├── 📄 api.ts
│   │   │   ├── 📄 auth.service.ts
│   │   │   ├── 📄 masterData.service.ts
│   │   │   ├── 📄 social.service.ts
│   │   │   └── 📄 student.service.ts
│   │   ├── 📁 types
│   │   │   ├── 📄 session.types.ts
│   │   │   ├── 📄 social.types.ts
│   │   │   └── 📄 student.types.ts
│   │   ├── 🎨 App.css
│   │   ├── 📄 App.tsx
│   │   ├── 🎨 index.css
│   │   └── 📄 main.tsx
│   ├── ⚙️ .env.example
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── 📄 eslint.config.js
│   ├── 🌐 index.html
│   ├── ⚙️ package.json
│   ├── 📄 postcss.config.js
│   ├── 📄 tailwind.config.js
│   ├── ⚙️ tsconfig.app.json
│   ├── ⚙️ tsconfig.json
│   ├── ⚙️ tsconfig.node.json
│   └── 📄 vite.config.ts
├── 📁 server
│   ├── 📁 src
│   │   ├── 📁 config
│   │   │   ├── 📄 cloudinary.ts
│   │   │   ├── 📄 cors.ts
│   │   │   ├── 📄 db.ts
│   │   │   ├── 📄 env.ts
│   │   │   ├── 📄 passport.ts
│   │   │   └── 📄 swagger.ts
│   │   ├── 📁 events
│   │   │   └── ⚙️ .gitkeep
│   │   ├── 📁 jobs
│   │   │   └── ⚙️ .gitkeep
│   │   ├── 📁 lib
│   │   │   └── 📄 cloudinaryUpload.ts
│   │   ├── 📁 modules
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📁 utils
│   │   │   │   │   ├── 📄 context.ts
│   │   │   │   │   ├── 📄 cookie.ts
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 session.ts
│   │   │   │   │   └── 📄 token.ts
│   │   │   │   ├── 📄 auth.constants.ts
│   │   │   │   ├── 📄 auth.controller.ts
│   │   │   │   ├── 📄 auth.messages.ts
│   │   │   │   ├── 📄 auth.routes.ts
│   │   │   │   ├── 📄 auth.service.ts
│   │   │   │   ├── 📄 auth.swagger.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 session.model.ts
│   │   │   ├── 📁 core
│   │   │   │   ├── 📁 constants
│   │   │   │   ├── 📁 models
│   │   │   │   │   ├── 📄 course.model.ts
│   │   │   │   │   ├── 📄 department.model.ts
│   │   │   │   │   └── 📄 hostel.model.ts
│   │   │   │   ├── 📄 masterData.constants.ts
│   │   │   │   ├── 📄 masterData.controller.ts
│   │   │   │   ├── 📄 masterData.messages.ts
│   │   │   │   ├── 📄 masterData.routes.ts
│   │   │   │   ├── 📄 masterData.service.ts
│   │   │   │   └── 📄 masterData.swagger.ts
│   │   │   ├── 📁 organizations
│   │   │   │   ├── 📁 constants
│   │   │   │   │   ├── 📄 organization.constants.ts
│   │   │   │   │   ├── 📄 organizationDuty.constants.ts
│   │   │   │   │   └── 📄 organizationRequest.constants.ts
│   │   │   │   ├── 📁 orgReq
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 orgReq.controller.ts
│   │   │   │   │   ├── 📄 orgReq.model.ts
│   │   │   │   │   └── 📄 orgReq.service.ts
│   │   │   │   ├── 📁 utils
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 orgReq.utils.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 orgFlows.ts
│   │   │   │   ├── 📄 organization.messages.ts
│   │   │   │   ├── 📄 organization.model.ts
│   │   │   │   ├── 📄 organization.routes.ts
│   │   │   │   ├── 📄 organization.swagger.ts
│   │   │   │   └── 📄 organizationDuty.model.ts
│   │   │   ├── 📁 pors
│   │   │   │   ├── 📁 constants
│   │   │   │   │   ├── 📄 permissions.constants.ts
│   │   │   │   │   ├── 📄 por.constants.ts
│   │   │   │   │   └── 📄 tenure.constants.ts
│   │   │   │   ├── 📁 porAssignments
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 porAssignment.controller.ts
│   │   │   │   │   ├── 📄 porAssignment.messages.ts
│   │   │   │   │   ├── 📄 porAssignment.model.ts
│   │   │   │   │   └── 📄 porAssignment.service.ts
│   │   │   │   ├── 📁 porClaims
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 porClaim.controller.ts
│   │   │   │   │   ├── 📄 porClaim.messages.ts
│   │   │   │   │   ├── 📄 porClaim.model.ts
│   │   │   │   │   └── 📄 porClaim.service.ts
│   │   │   │   ├── 📁 roles
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   └── 📄 porRole.model.ts
│   │   │   │   ├── 📁 tenureConfig
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 tenureConfig.utils.ts
│   │   │   │   │   ├── 📄 tenureRoleConfig.controller.ts
│   │   │   │   │   ├── 📄 tenureRoleConfig.model.ts
│   │   │   │   │   └── 📄 tenureRoleConfig.service.ts
│   │   │   │   ├── 📁 tenures
│   │   │   │   │   ├── 📁 utils
│   │   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   │   └── 📄 tenure.utils.ts
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 tenure.controller.ts
│   │   │   │   │   ├── 📄 tenure.messages.ts
│   │   │   │   │   ├── 📄 tenure.model.ts
│   │   │   │   │   └── 📄 tenure.service.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 pors.routes.ts
│   │   │   │   └── 📄 pors.swagger.ts
│   │   │   ├── 📁 social
│   │   │   │   ├── 📁 block
│   │   │   │   │   ├── 📄 block.controller.ts
│   │   │   │   │   ├── 📄 block.model.ts
│   │   │   │   │   ├── 📄 block.service.ts
│   │   │   │   │   ├── 📄 block.swagger.ts
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 follow
│   │   │   │   │   ├── 📄 follow.controller.ts
│   │   │   │   │   ├── 📄 follow.model.ts
│   │   │   │   │   ├── 📄 follow.service.ts
│   │   │   │   │   ├── 📄 follow.swagger.ts
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 utils
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 pagination.utils.ts
│   │   │   │   │   └── 📄 relationships.utils.ts
│   │   │   │   ├── 📄 social.constants.ts
│   │   │   │   ├── 📄 social.messages.ts
│   │   │   │   ├── 📄 social.routes.ts
│   │   │   │   └── 📄 socialMessages.ts
│   │   │   └── 📁 students
│   │   │       ├── 📁 utils
│   │   │       │   ├── 📄 index.ts
│   │   │       │   ├── 📄 privacy.ts
│   │   │       │   ├── 📄 rollNo.ts
│   │   │       │   └── 📄 search.ts
│   │   │       ├── 📄 index.ts
│   │   │       ├── 📄 student.constants.ts
│   │   │       ├── 📄 student.controller.ts
│   │   │       ├── 📄 student.messages.ts
│   │   │       ├── 📄 student.model.ts
│   │   │       ├── 📄 student.routes.ts
│   │   │       ├── 📄 student.service.ts
│   │   │       └── 📄 student.swagger.ts
│   │   ├── 📁 seeds
│   │   │   ├── 📁 masterData
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 seed.ts
│   │   │   ├── 📁 pors
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 seed.ts
│   │   │   ├── 📁 roles
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 seed.ts
│   │   │   ├── 📁 shared
│   │   │   │   └── 📄 runSeedTask.ts
│   │   │   ├── 📁 testStudents
│   │   │   │   ├── 📄 cleanup.index.ts
│   │   │   │   ├── 📄 cleanup.ts
│   │   │   │   ├── 📄 data.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 seed.ts
│   │   │   └── 📄 index.ts
│   │   ├── 📁 shared
│   │   │   ├── 📁 constants
│   │   │   │   ├── 📄 cors.constants.ts
│   │   │   │   ├── 📄 http-status.constants.ts
│   │   │   │   └── 📄 upload.constants.ts
│   │   │   ├── 📁 docs
│   │   │   │   └── 📄 base.swagger.ts
│   │   │   ├── 📁 middleware
│   │   │   │   ├── 📄 auth.middleware.ts
│   │   │   │   ├── 📄 errorHandler.ts
│   │   │   │   ├── 📄 orgPermission.middleware.ts
│   │   │   │   └── 📄 upload.middleware.ts
│   │   │   └── 📁 utils
│   │   │       ├── 📄 ApiError.ts
│   │   │       ├── 📄 ApiResponse.ts
│   │   │       ├── 📄 asyncHandler.ts
│   │   │       ├── 📄 index.ts
│   │   │       ├── 📄 mongooseHelper.ts
│   │   │       └── 📄 validationHandler.ts
│   │   ├── 📁 types
│   │   │   └── 📄 express.d.ts
│   │   ├── 📁 validations
│   │   │   ├── 📄 masterData.validation.ts
│   │   │   ├── 📄 organizationRequest.validation.ts
│   │   │   ├── 📄 porAssignment.validation.ts
│   │   │   ├── 📄 social.validation.ts
│   │   │   ├── 📄 student.validation.ts
│   │   │   ├── 📄 tenure.validation.ts
│   │   │   └── 📄 tenureRoleConfig.validation.ts
│   │   ├── 📄 app.ts
│   │   └── 📄 server.ts
│   ├── ⚙️ .env.example
│   ├── 📝 Current_Status.md
│   ├── ⚙️ package.json
│   └── ⚙️ tsconfig.json
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── ⚙️ .prettierignore
├── ⚙️ .prettierrc
├── 📝 PRD.md
├── 📝 Product_Implementation_Blueprint.md
├── 📝 README.md
├── 📄 eslint.config.mjs
├── 📝 filetree.md
├── ⚙️ package-lock.json
├── ⚙️ package.json
└── ⚙️ tsconfig.base.json
```

---

_Generated by FileTree Pro Extension_
