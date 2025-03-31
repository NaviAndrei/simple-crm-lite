# Simple CRM Lite

A lightweight Customer Relationship Management system built with Flask (backend) and React (frontend). This portfolio project demonstrates my full-stack development skills and understanding of business application architecture.

## Screemshots

![Dashboard](https://github.com/NaviAndrei/simple-crm-lite/blob/main/screenshots/Dashboard.png)
![Companies Page](https://github.com/NaviAndrei/simple-crm-lite/blob/main/screenshots/Companies-Page.png)
![Sales-Pipeline-Page](https://github.com/NaviAndrei/simple-crm-lite/blob/main/screenshots/Sales-Pipeline.png)
![Task Management-Page](https://github.com/NaviAndrei/simple-crm-lite/blob/main/screenshots/Task-Management.png)
![Add-Contact-Page](https://github.com/NaviAndrei/simple-crm-lite/blob/main/screenshots/Add-New-Contact.png)

## Technologies

### Backend
- Python 3.13+
- Flask - Web framework
- SQLAlchemy - ORM for database interactions
- Flask-Migrate - Database migrations

### Frontend
- Language: JavaScript
- Core Library: React.js (for building the user interface)
- UI Component Library: Material UI (MUI) (Used for components like tables, dialogs, buttons, chips in the Task section)
- HTTP Client: Axios (for making API requests to the Flask backend)
- Routing: React Router (for handling navigation within the single-page application)
- Date Formatting: date-fns (Used for formatting dates, e.g., in the task list)
- State Management: React Context API (Used for managing global state like notifications)
- Styling: CSS(custom CSS and Bootstrap/MUI styling)

### Database
- SQLite (development)
- Easily configurable for PostgreSQL/MySQL (production)

## Features

- **Contact Management**
  - Create, view, edit, and delete contacts
  - Categorize contacts (Lead, Customer, Prospect)
  - Track sales stage progression

- **Company Organization**
  - Link contacts to companies
  - Track company-specific interactions
  - Manage company information

- **Sales Pipeline**
  - Visual sales funnel
  - Status tracking from lead to closed deal
  - Performance metrics

- **Task Management**
  - Create and assign tasks
  - Set deadlines
  - Track completion status

- **Interactive Dashboard**
  - Key performance indicators
  - Recent activities
  - Data visualizations

- **Activity Logging**
  - Record calls, emails, and meetings
  - Notes and follow-up reminders
  - Historical interaction timeline

## Screenshots

![Dashboard](screenshots/dashboard.png)
![Contacts Page](screenshots/contacts.png)
![Sales Pipeline](screenshots/pipeline.png)
![Task Management](screenshots/tasks.png)

## Installation

### Prerequisites
- Python 3.13+
- Node.js 14+
- npm or yarn

### Backend Setup
1. Clone this repository
   ```bash
   git clone https://github.com/NaviAndrei/simple-crm-lite.git
   cd SimpleCrmLite
   ```

2. Create and activate virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install backend dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

5. Run development server
   ```bash
   flask run
   ```

### Frontend Setup
1. Navigate to frontend directory
   ```bash
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start development server
   ```bash
   npm start
   # or
   yarn start
   ```

## Usage

Once both servers are running:
- Backend API will be available at http://localhost:5000
- Frontend will be available at http://localhost:3000

You can start managing your contacts, companies, and sales pipeline.

## What I Learned

This project helped me develop and demonstrate:

- Full-stack application architecture design
- RESTful API development with Flask
- React component design and state management
- Database modeling and relationships
- UI/UX design for business applications
- Authentication and authorization implementation
- Git workflow and project organization

## Future Improvements

- Email integration for notifications
- Calendar integration
- Mobile application using React Native
- Advanced reporting and analytics
- User role management
- Document management
- Expanded dashboard with more KPIs

## Contact

Feel free to contact me for any questions or feedback about this project:

- **Name**: Andrei Ivan
- **Email**: andrei.ivan1208@gmail.com
- **GitHub**: [NaviAndrei](https://github.com/NaviAndrei)
