# Verification record

Verified on 23 October 2026. Application: Trajectory. Browser: Chrome. Fictional data only.

## Build and automated checks

- TypeScript compilation and Vite production build passed.
- Four Node test groups passed: demo relationships, measurement chronology and bounds, baseline defaults, and localStorage loading and malformed JSON recovery.
- Dependency installation initially reported zero vulnerabilities. A later standalone audit refresh could not reach the registry endpoint.
- No em dash characters in application source or shipped copy.

## Full browser workflow

A new player named Neil Desai was added to the U16 squad with shirt number 17. Searching Neil returned the correct record. His passport initially had no assessments or plans.

An assessment was recorded with technical 55 and the other dimensions at 70, with coach observations about first touch. The plan form displayed that assessment and technical as the lowest-scored dimension.

An IDP named Receive into space was created with baseline 10, target 22, protocol successful receives / 30, deadline 6 December 2026 and coach approval. An invalid target of 5 was rejected before saving.

A Receiving under pressure cluster was created with Neil and Arjun. A Passive-pressure receiving intervention was scheduled against Neil's approved plan and the cluster. The session was marked completed and observations saved.

A measurement of 18 was recorded. The passport displayed baseline 10, current 18, target 22, calculated progress 67%, the assessment, completed session and measurement milestone. All these records remained after a browser refresh. Editing the target to 24 worked.

## Additional checks

- All eight sections were opened through working navigation.
- At 390px width all eight pages had a document width of 390px. Wide assessment and dashboard tables scroll inside their containers.
- Mobile dashboard, player passport and assessment dialog were visually inspected.
- Desktop dashboard and hero image were visually inspected.
- A short-window sidebar issue was found and fixed. Settings remained reachable.
- Export produced a completed trajectory-academy.json browser download. Its JSON was parsed and contained 9 players, 15 assessments, 6 plans, 4 clusters, 5 interventions and 7 measurements, matching the test workflow.
- Reset displayed an in-app confirmation. Keeping changes preserved the 9-player dataset. Restoring the sample academy returned to 8 players and remained restored after refresh.
- Squad filters updated the displayed players and assessment counts.
- Scheduling an intervention against Ishaan's unapproved plan was rejected.
- Scheduling Arjun's plan against a cluster without Arjun was rejected.
- Browser console check returned no captured warnings or errors during the core workflow.

## Deployment

The GitHub repository was created under elprofessor-15 as a private repository. Vercel connected the repository and deployed the static build on the existing Hobby team. The production URL returned HTTP 200 without a login challenge. A subsequent update was blocked by Vercel because the local Git author email was unrecognised; repository-scoped Git identity was then corrected to the authenticated GitHub account’s noreply address before redeploying. No billing details, paid APIs, backend or payment integration were added.

## Scope of verification

Browser QA covers the flows above, not every possible combination of invalid input, browser extension or device. The app stores data separately per browser and origin, without server synchronisation. Coach and player modes are presentation shortcuts, not access controls. Printing uses the browser print dialog and a dedicated print stylesheet; physical printed output was not verified.
