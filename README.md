# ShramaSetu - A Mango Bytes initiative

A mobile-first financial inclusion prototype for blue-collar workers and contractors.

Built with React, Vite, Tailwind CSS, and mock data for hackathon demo flows.


## Prototype additions
- Registration form uses blank fields by default; demo data is only inserted when the user presses “Use example”.
- Primary and additional skills cover construction and industrial roles.
- Insurance recommendations analyse all entered skills and show prototype mandatory coverage.
- Mango AI Assistant is a local prototype chatbot with canned guidance; it does not call an external AI service.
- Registration profile details are stored in in-memory app state and displayed from the user-entered values.

## Updated prototype features
- ShramaSetu branding with Labourer, Contractor and Skilled Worker registration paths.
- Gender field and 10-digit mobile/name validation in registration for every account type.
- Skilled Worker profiles for chefs, hotel-management workers, Ola/Uber drivers, delivery drivers and other professions.
- Search/filter workers by skill, including a clickable Mason filter that lists all Mason profiles.
- ShramaID + Workforce Trust Score + credential/escrow-ready profile details in contractor worker profiles.
- Direct Home Work invitations for labourers and skilled workers.
- Read-message state is cleared as soon as a conversation is opened.
- AI Skilled Worker Coach for resume preparation, language learning, computer basics, internship-style practice and profession-specific YouTube learning searches.
- Added the supplied Smart Workforce, home-work, Resume Barrier and Up-Skilling Bridge images to the portal.

## Latest prototype updates
- Text from the supplied reference photos has been implemented as UI/features rather than displayed as photos.
- Profile-first hiring: workers are discoverable through practical skills, credentials, past work and ShramaID instead of requiring polished corporate CVs.
- Hyper-local matching: 5–15 km matching guidance is surfaced for workers and contractors.
- Micro-enterprise hiring: local garages, manufacturing units, electricians and similar businesses can directly post requirements.
- Up-skilling bridge: short courses and micro-credentials for modern machinery, solar PV, EV charging and related skills.
- Personalized Career Roadmap: step-by-step career goals, progress tracking and next actions.
- Smart money nudges: connect savings to career goals and remind users before unnecessary spending.
- Skilled Worker AI Coach includes resume/profile help, career roadmaps, languages, computer skills, interview practice and internship-style profession demos.
- No reference photos are loaded or rendered in the frontend.


## Smart Savings
Savings are dynamic rather than performance-based pay: low-income days can save ₹0, stronger days save 2%, and very good days save 3% of daily earnings.


## Google Translate integration
The Translator chatbot now connects to Google Cloud Translation - Basic (v2) when `VITE_GOOGLE_TRANSLATE_API_KEY` is configured. The v2 `translate` endpoint accepts API-key authentication and returns translated text; without the key, the prototype falls back to its built-in workplace phrases. See Google’s Cloud Translation docs for setup and authentication.

Create a `.env.local` file in the project root:

```env
VITE_GOOGLE_TRANSLATE_API_KEY=YOUR_GOOGLE_CLOUD_API_KEY
```

Enable **Cloud Translation API** in the Google Cloud project and restrict the API key to the Translation API and the domains/origins where the prototype will run. For a production deployment, prefer a server-side proxy or Cloud Translation Advanced with service-account/IAM authentication so the credential is not exposed in the browser.
