import os
import sys

# Add current directory to path so 'app' can be found
sys.path.append(os.getcwd())

from app.main import app
from fastapi.routing import APIRoute

output = "# Marvel Steel API Documentation\n\n"

for route in app.routes:
    if isinstance(route, APIRoute):
        methods = ", ".join(route.methods)
        path = route.path
        desc = route.description or "No description provided."
        
        # Check authentication requirements
        auth_req = "Public"
        for dep in route.dependant.dependencies:
            dep_name = dep.call.__name__ if hasattr(dep.call, '__name__') else str(dep.call)
            if "get_current_super_admin" in dep_name:
                auth_req = "Super Admin"
            elif "get_current_admin" in dep_name:
                auth_req = "Admin (Staff or Super Admin)"
                
        # Determine parameters
        params = []
        # Path params
        for param in route.dependant.path_params:
            params.append(f"- **{param.name}** (Path): {param.type_.__name__ if hasattr(param, 'type_') and hasattr(param.type_, '__name__') else 'any'}")
        
        # Query params
        for param in route.dependant.query_params:
            params.append(f"- **{param.name}** (Query): {param.type_.__name__ if hasattr(param, 'type_') and hasattr(param.type_, '__name__') else 'any'}")
            
        # Body params
        if route.dependant.body_params:
            for param in route.dependant.body_params:
                 params.append(f"- **{param.name}** (Body): {param.type_.__name__ if hasattr(param, 'type_') and hasattr(param.type_, '__name__') else 'JSON/Form'}")
                 
        params_str = "\n".join(params) if params else "None"
        
        output += f"### {methods} {path}\n"
        output += f"- **Description**: {desc}\n"
        output += f"- **Authentication**: {auth_req}\n"
        output += f"- **Parameters**:\n"
        if params:
            output += f"{params_str}\n"
        else:
            output += "  - None\n"
        
        output += "\n---\n"

with open("api_docs_dump.md", "w") as f:
    f.write(output)
print("api_docs_dump.md written successfully.")
