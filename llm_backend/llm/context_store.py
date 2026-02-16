from typing import Optional


class ContextStore:
    def __init__(self):
        self.last_context: Optional[str] = None
        self.last_question: Optional[str] = None


context_store = ContextStore()
