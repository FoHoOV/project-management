# Project management app

A simple project management app.

# Features:

1. creating projects (with add/edit/delete)
2. each project can have many todo categores (with add/edit/delete)
3. each category can have many todo item (with add/edit/delete)
4. each category can be shared among diffrent projects (with detach/attach)
5. each project can be shared with other users (with detach/attach, only owners can share with other users)
6. each todo can have many comments (with add/edit/delete)
7. you can sort todo categories or todo items in any arbitrary order and it will be saved on your user account (I'm storing this using linked list)
8. each todo can have multiple tags (with add/edit/delete)
9. you can search (all projects/project specific) by tag
10. adding todo dependencies which also works across projects (with add/delete) - for instance you can't mark a todo as `Done` unless all of its dependencies or dependencies of those dependencies are marked as `Done`
11. creating projects from a default template
12. adding rules to todo categories (currently we only support `MARK_AS_DONE` and `MARK_AS_UNDONE` action meaning when you move a todo item to a todo category, it will be automatically marked as `Done` or `Undone` depending on what you chose)
13. setting due dates for each todoitem (with add/edit/remove)
14. setting custom permissions per user
15. changing project permissions in project settings page (only owners can change permissions)

- You can use the backend project independently to create your own clients and interfaces

# Demo

You can find the demo at [this](https://project-management-fohoov.vercel.app) url (it might not work for the first few requests (because service will go down after inactivity), but after 1 or 2 minutes it will start working again).

# How to run

1. goto the backend project and follow the steps of its [README.md](https://github.com/FoHoOV/project-management/blob/master/backend/README.md)
2. goto the frontend project and follow the steps of its [README.md](https://github.com/FoHoOV/project-management/blob/master/frontend/README.md)

# Known bugs

- nothing for now >_<

# Goals

The goal of this project is to have most of ASANA's features (step by step tho)
one day.

# IDK what the title should be

Please give this project a star if you liked it (●'◡'●). Oh, and also I would love any contributions or improvements to this hobby project ^_^
