# Coffee Connoisseur Website TODO

## Landing Page Features
- [x] Hero section with tagline "For the Connoisseur, Not the Snob"
- [x] Feature showcase sections
- [x] Call-to-action buttons
- [x] Responsive mobile-friendly design
- [x] Coffee-themed imagery and branding

## App Features to Highlight
- [x] Grind size recommendations paired to grinder type
- [x] Universal flavor verbiage system (light to dark with flavor notes)
- [x] Regional/geographical bean information with history
- [x] Altitude and farm details
- [x] Water temperature and brew ratio recommendations
- [x] Competition recipes (pour over, AeroPress)
- [x] Standardized feedback system for brew adjustments
- [x] Bean recommendations based on preferences
- [x] Minimal brew amount for testing
- [x] Bean cellar/inventory tracking
- [x] Palate profile intake assessment
- [x] Seasonal coffee recommendations
- [x] Gamification with badges and levels
- [x] Local roaster partnerships and recommendations
- [x] Community features and Discord integration

## Design Elements
- [x] Modern, clean design with coffee color palette
- [x] High-quality coffee images
- [x] Smooth animations and transitions
- [x] Clear typography hierarchy
- [x] Mobile-first responsive layout

## Palate Quiz Feature
- [x] Multi-step quiz form component
- [x] Question categories: flavor preferences, roast preferences, brewing methods, taste sensitivity
- [x] Progress indicator for quiz steps
- [x] Quiz results page with personalized profile
- [x] Coffee recommendations based on quiz results
- [x] Bean suggestions matching user profile
- [x] Brewing method recommendations
- [x] Route for quiz page (/quiz)
- [x] Route for results page (/profile)
- [x] Link quiz from landing page hero and CTA sections

## Brew Journal Feature
- [ ] Journal list page showing all brew entries
- [ ] Add new entry form with photo upload
- [ ] Brew parameters: bean name, origin, roast level, grind size, brew method
- [ ] Brewing details: water temp, brew time, coffee-to-water ratio
- [ ] Rating system (1-5 stars)
- [ ] Tasting notes and observations text area
- [ ] Photo upload for brew setup and result
- [ ] Entry detail view page
- [ ] Edit and delete functionality
- [ ] Filter/sort entries by date, rating, brew method
- [ ] Route for journal page (/journal)
- [ ] Route for entry detail (/journal/:id)
- [ ] Add journal link to navigation
- [ ] Local storage for persisting entries

## Full-Stack Conversion & Database Integration
- [x] Upgrade project to web-db-user template
- [x] Create database schema for coffee roasters
- [x] Create database schema for roaster reviewsles
- [x] Build API endpoints for brew journal (create, read, update, delete)
- [x] Integrate S3 file storage for photo uploads
- [x] Update Journal page to use API instead of localStorage
- [x] Add user authentication for personalized journals
- [x] Migrate existing localStorage data structure to database
- [x] Test database persistence and file uploads
- [x] Add loading states and error handling for API calls

## Roaster Map Feature
- [x] Create database schema for coffee roasters
- [x] Create database schema for roaster reviews
- [x] Build API endpoints for roasters (list, search, filter)
- [x] Build API endpoints for reviews (create, read)
- [x] Create Roasters page with Google Maps integration
- [x] Implement map markers for roaster locations
- [x] Add filters for bean origin and roast style
- [x] Add review submission and display
- [x] Add roaster detail view with reviews
- [x] Link roaster map from navigation
- [x] Seed database with sample roaster data
- [x] Test map functionality and filters