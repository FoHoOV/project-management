# todos
A todo app. The goal of this project is to have most of ASANA's features (step by step tho)
one day.

features it has right now:
  1. creating projects (with add/edit/delete)
  2. each project can have many todo categores (with add/edit/delete)
  3. each category can have many todo item (with add/edit/delete)
  4. each category can be shared among diffrent projects (with detach/attach)
  5. each project can be shared with other users (with detach/attach)
  6. each todo can have many comments (with add/edit/delete)
  7. you can sort todo categories or todo items in any arbitrary order and it will be saved on your user account (I'm storing this using linked list)
  8. each todo can have multiple tags (with add/edit/delete)
  9. you can search (all projects/project specific) by tag
  10. adding todo dependencies which also works across projects (with add/delete) - for instance you can't mark a todo as `Done` unless all of its dependencies or dependencies of those dependencies are marked as `Done`
  11. creating projects from a default template
  12. adding rules to todo categories (currently we only support `MARK_AS_DONE` action meaning when you move a todo item to a todo category, it will be automatically marked as `Done`)
  13. Setting due dates for each todoitem (with add/edit/remove)
      
# demo
You can find the demo at [this](https://todos-fohoov.vercel.app/) url (DO NOT USE AS YOUR DAILY DRIVER (which makes me very happy that you chose to do so ❤️), I MIGHT DELETE THE DB FROM TIME TO TIME).

# how to run
  1. goto the backend project and follow the steps of its README.md
  2. goto the frontend project and follow the steps of its README.md

# IMPORTANT
you might need to delete the database after an update. I'll not implement migrations until I'm completely happy with the project.

# IDK what the title should be
Please give this project a star if you liked it (●'◡'●). Oh, and also I would love any contributions or improvements to this hobby project ^_^
