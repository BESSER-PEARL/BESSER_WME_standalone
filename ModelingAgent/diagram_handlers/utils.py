"""
Utility functions for diagram handling
"""

import json
from typing import Optional


def extract_diagram_type_from_message(message: str) -> Optional[str]:
    """Extract diagram type from user message if it's a JSON payload or has prefix"""
    # Check for [DIAGRAM_TYPE:XXX] prefix
    import re
    prefix_match = re.match(r'^\[DIAGRAM_TYPE:(\w+)\]', message)
    if prefix_match:
        return prefix_match.group(1)
    
    # Try JSON payload
    try:
        if message.strip().startswith('{'):
            data = json.loads(message)
            if 'diagramType' in data:
                return data['diagramType']
    except:
        pass
    return None


def detect_diagram_type_from_keywords(message: str) -> Optional[str]:
    """Detect diagram type from keywords in message"""
    message_lower = message.lower()
    
    # State machine keywords
    if any(keyword in message_lower for keyword in ['state', 'transition', 'state machine']):
        return 'StateMachineDiagram'
    
    # Agent diagram keywords
    if any(keyword in message_lower for keyword in ['agent', 'multi-agent', 'message', 'belief', 'goal']):
        return 'AgentDiagram'
    
    # Object diagram keywords
    if any(keyword in message_lower for keyword in ['object', 'instance', 'link']):
        return 'ObjectDiagram'
    
    # Class diagram (default)
    if any(keyword in message_lower for keyword in ['class', 'interface', 'inheritance', 'association']):
        return 'ClassDiagram'
    
    return None


def is_single_element_request(message: str) -> bool:
    """Check if user wants to add a single element (not a complete system)"""
    message_lower = message.lower()
    
    # First check if it's a system request - those take priority
    if is_complete_system_request(message):
        return False
    
    # Then check for single element keywords
    single_keywords = ['add a', 'create a', 'make a', 'new', 'insert a', 'add an', 'create an']
    return any(keyword in message_lower for keyword in single_keywords)


def is_complete_system_request(message: str) -> bool:
    """Check if user wants a complete system with multiple elements and relationships"""
    message_lower = message.lower()
    
    # Strong system indicators
    system_keywords = [
        'system', 'complete system', 'full system', 
        'entire system', 'design', 'architecture',
        'multiple classes', 'with relationships',
        'e-commerce', 'library', 'banking',
        'management system', 'platform'
    ]
    return any(keyword in message_lower for keyword in system_keywords)
