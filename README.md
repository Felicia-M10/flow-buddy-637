# UnifiedFlow AI

Build ONE Integrated AI Productivity Workspace

Create ONE single integrated web application for AI-powered productivity and task management.

IMPORTANT: This is ONE project, ONE application, ONE database, and ONE unified user experience. Do NOT build separate projects, separate applications, or disconnected modules.

All features must work together and share the same user account, task data, schedules, AI context, research history, and settings.

The application should combine:

Task Management

AI Task Planner / Scheduler

AI Research Assistant

AI Workplace Chatbot

Calendar

Productivity Analytics

Dark Mode

Everything must be accessible from one unified dashboard and navigation system.

1. Overall Concept

Build a modern productivity platform called TaskFlow AI.

The goal is to allow a user to manage their entire workflow from one place.

The user should be able to:

Create a task → prioritize it → ask AI to schedule it → view it on the calendar → complete it → analyze productivity → ask the AI assistant about it.

The AI Research Assistant and AI Chatbot must also be part of the same application.

For example:

User creates "Complete Programming Assignment."

The task is stored in the main task system.

The user can then ask:

"Plan my day."

The AI Planner sees the existing task and schedules it based on priority, deadline, duration, and available time.

The task appears automatically in the calendar.

The user can then ask the AI Chatbot:

"What should I work on next?"

The chatbot should use the user's actual tasks and schedule to answer.

This demonstrates that all features are connected to the same system.

2. Single Application Architecture

Use one unified application structure.

Shared data

All features must use the same:

User account

Tasks

Categories

Priorities

Deadlines

Calendar events

AI-generated schedules

Research history

Chat history

Notifications

Productivity statistics

User preferences

Dark/light mode settings

Do NOT create separate task systems for the AI Planner and Dashboard.

The AI Planner must use the same tasks created in the main Task Management section.

Do NOT create a separate calendar for the AI Planner.

The AI Planner must generate schedules using the same calendar.

Do NOT create a separate AI chatbot database.

The chatbot must access the user's existing tasks, schedules, and relevant research history when appropriate.

3. Main Navigation

Create one consistent sidebar:

TaskFlow AI

🏠 Dashboard

✓ My Tasks

📅 Calendar

✨ AI Planner

🔍 AI Research

💬 AI Assistant

📊 Productivity

⚙ Settings

The sidebar should remain consistent throughout the application.

On mobile, convert it into a responsive hamburger/bottom navigation system.

4. Dashboard

The dashboard is the central home page of the entire application.

Display:

Header

"Good morning, [User Name] 👋"

"Let's make today productive."

Include:

Search

Notifications

AI Assistant

Dark mode toggle

User profile

Summary cards

Total Tasks

Completed

Due Today

Productivity

These statistics must be calculated from the user's actual tasks.

Today's Workspace

Below the summary cards, display:

Today's Tasks

Show tasks scheduled for today.

Each task should display:

Completion checkbox

Task name

Priority

Category

Due time

Duration

Status

AI Schedule

Display the user's AI-generated schedule for the day.

Button:

✨ Optimize My Day

This should use the user's existing tasks.

Upcoming

Show upcoming tasks and deadlines.

5. Task Management

Create one central task management system.

Users can:

Create tasks

Edit tasks

Delete tasks

Complete tasks

Reopen completed tasks

Set deadlines

Set time

Set duration

Set priority

Add descriptions

Add categories

Add tags

Create recurring tasks

Search tasks

Filter tasks

Sort tasks

Priority

Low

Medium

High

Urgent

Categories

Default categories:

Work

Personal

Study

Meetings

Projects

Other

Allow users to create custom categories.

6. AI Task Planner / Scheduler

The AI Planner is not a separate task manager.

It must work directly with the main task system.

When the user opens AI Planner, show their existing tasks.

Provide:

AI Planning Prompt

"What would you like to accomplish?"

Allow the user to enter additional instructions.

Example:

"Help me organize everything I need to finish this week."

The AI should analyze the user's existing tasks.

Consider:

Priority

Deadline

Duration

Current schedule

Available working hours

Existing calendar events

Workload

Breaks

Then generate an optimized schedule.

Daily Schedule

Example:

08:00 – 09:30

Complete Programming Assignment
🔴 High Priority

09:30 – 09:45

Break

09:45 – 10:45

Study Data Structures
🟡 Medium Priority

The user can:

Accept

Edit

Regenerate

Move

Save

When the user clicks Save Schedule, the scheduled tasks must automatically appear in the same Calendar and Task system.

7. Weekly AI Scheduler

Allow users to generate an entire weekly plan.

Display:

Monday → Sunday

The AI distributes tasks intelligently across the week.

If the workload is too large, tell the user:

"You have more work than available time this week. I recommend moving these lower-priority tasks to next week."

Explain why tasks were prioritized.

8. Calendar

Create ONE calendar shared by the entire application.

Views:

Day

Week

Month

Display:

Tasks

AI scheduled tasks

Deadlines

Meetings

Events

Users can drag and drop tasks to change their schedule.

Changes made in the calendar must update the main task system.

Changes made to tasks must update the calendar.

9. AI Research Assistant

The AI Research Assistant is another feature inside the same TaskFlow AI application.

It should not be a separate application.

Allow users to:

Research a topic

Paste an article

Paste text

Ask questions

Summarize information

Extract key points

Generate insights

Generate recommendations

Compare information

Create notes

Research interface

Title:

AI Research Assistant

Input:

"What would you like to research?"

Button:

✨ Research with AI

Results should display:

Summary

Key Points

AI Insights

Recommendations

Further Questions

Allow:

Save Research

Copy

Regenerate

Ask Follow-up

Saved research should be stored in the user's Research History within the same application.

10. Connection Between Research and Tasks

The AI Research Assistant should be able to work with the task system.

For example:

User asks:

"Research cloud computing."

The AI produces research.

The user can then click:

Create Task From Research

The system creates a task in the main Task Management system.

Example:

Task: Review cloud computing research
Category: Study
Priority: Medium
Deadline: User selected

This task should automatically appear in:

My Tasks

Dashboard

AI Planner

Calendar

Productivity analytics

This is essential to demonstrate that the application is integrated.

11. AI Workplace Chatbot

Create one AI chatbot called:

TaskFlow AI Assistant

This chatbot must be connected to the entire application.

It should be able to understand the user's:

Tasks

Priorities

Deadlines

Calendar

AI schedules

Research history

Productivity data

Example commands

"Plan my day."

"What are my urgent tasks?"

"Move unfinished tasks to tomorrow."

"What should I work on next?"

"Create a weekly schedule."

"Summarize this article."

"Turn this research into a task."

"What tasks are due this week?"

"Am I overloaded today?"

The chatbot should respond using the user's actual application data rather than generic responses.

12. AI Quick Actions

Make the AI available throughout the application.

Use a floating ✨ AI button.

When clicked, display:

Plan My Day

Create Weekly Schedule

Prioritize My Tasks

Research a Topic

Summarize Text

Ask AI

These actions should open the relevant AI functionality inside the same application, without creating another project or page system.

13. Productivity Analytics

Use the same task data to calculate:

Tasks completed

Tasks remaining

Completion percentage

Weekly productivity

Overdue tasks

High-priority tasks completed

Most productive day

Average completion rate

The analytics must automatically update whenever a task is:

Created

Completed

Deleted

Rescheduled

14. Notifications

Use one notification system across the application.

Notify users about:

Upcoming deadlines

Overdue tasks

AI schedule recommendations

Rescheduled tasks

Calendar events

Productivity milestones

15. Dark Mode

Include a Light/Dark Mode toggle.

Light Mode

Use:

White

Very light lavender

Purple

Dark gray

Dark Mode

Use:

Deep charcoal

Dark purple

Soft lavender

White/light gray text

The selected theme must persist across the entire application.

Do not make dark mode apply only to the dashboard.

Every page and component must support the same theme.

16. Visual Design

Use a minimal, calming purple design system.

Primary color

Calming purple.

Supporting colors

Lavender

Soft violet

White

Charcoal

Muted gray

Use purple for:

Primary buttons

Active navigation

AI features

Progress indicators

Important highlights

Use rounded cards, clean typography, subtle shadows, consistent spacing, and simple icons.

Avoid:

Excessive gradients

Clutter

Too many colors

Overly complicated animations

Unnecessary decorative elements

The application should feel like a premium modern SaaS productivity platform.

17. Important Integration Rules

These rules are mandatory:

ONE PROJECT

Build only one application/project.

ONE USER SYSTEM

Use one authentication/user system.

ONE TASK DATABASE

All tasks must come from one central task system.

ONE CALENDAR

The Dashboard, AI Planner, and Calendar must use the same schedule data.

ONE AI ASSISTANT

The AI chatbot should have access to relevant information from the user's workspace.

ONE RESEARCH HISTORY

Research created by the AI Research Assistant should be stored in the same user's account.

ONE SETTINGS SYSTEM

Theme, notifications, AI preferences, and user settings must apply globally.

CONNECT EVERYTHING

Changes in one part of the application must be reflected everywhere else.

For example:

Create Task

→ My Tasks
→ Dashboard
→ AI Planner
→ Calendar
→ Notifications
→ Productivity Analytics
→ AI Assistant

Complete Task

→ My Tasks updates
→ Dashboard updates
→ Calendar updates
→ Productivity statistics update
→ AI Assistant can recognize the task is complete

AI Schedule

→ Uses existing tasks
→ Creates schedule
→ Updates Calendar
→ Updates task schedule
→ Appears on Dashboard
→ AI Assistant can reference it

Research

→ AI Research Assistant
→ Save Research
→ Create Task from Research
→ Task appears everywhere
→ AI Assistant can reference the task

18. Final User Experience

The final product should feel like one intelligent workspace, not a collection of separate tools.

The user should be able to move naturally between:

Dashboard → Tasks → AI Planner → Calendar → Research → AI Assistant → Productivity

without feeling like they are leaving the application.

The main concept should be:

"One workspace. One task system. One AI assistant. Everything connected."

Build the interface to be minimal, modern, responsive, professional, calming, and production-ready, with a purple/lavender visual identity and complete dark mode support.

Do not create multiple projects or disconnected applications. Everything must be implemented as one integrated TaskFlow AI productivity platform.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7698e919-5c09-4395-b7ee-556117d5b3af).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
