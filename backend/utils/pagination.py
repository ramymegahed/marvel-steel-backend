from typing import Optional
from fastapi import Query

def get_pagination_params(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Max number of records to return")
):
    return {"skip": skip, "limit": limit}
