# Intelligent UML Modeling Assistant Bot
# This bot uses OpenAI to understand and create any UML model based on natural language
# Supports: ClassDiagram, ObjectDiagram, StateMachineDiagram, AgentDiagram

import logging
import json
import uuid
import re
import random
from typing import Dict, Any, List, Optional

from besser.agent.core.agent import Agent
from besser.agent.core.session import Session
from besser.agent.library.transition.events.base_events import ReceiveJSONEvent
from besser.agent.exceptions.logger import logger
from besser.agent.nlp.intent_classifier.intent_classifier_configuration import LLMIntentClassifierConfiguration
from besser.agent.nlp.llm.llm_openai_api import LLMOpenAI

from diagram_handlers.factory import DiagramHandlerFactory, get_diagram_type_info
from diagram_handlers.utils import (
    extract_diagram_type_from_message,
    is_single_element_request,
    is_complete_system_request,
    is_modification_request,
    detect_diagram_type_from_keywords
)

# Layout defaults for newly generated Apollon elements
LAYOUT_BASE_X = -940
LAYOUT_BASE_Y = -600
LAYOUT_X_SPREAD = 360
LAYOUT_Y_SPREAD = 280
CLASS_WIDTH = 220
ATTRIBUTE_HEIGHT = 25
METHOD_HEIGHT = 25
CLASS_HEADER_HEIGHT = 50

# Configure the logging module
logger.setLevel(logging.INFO)

# Create the agent
agent = Agent('uml_modeling_agent')

agent.load_properties('config.ini')

websocket_platform = agent.use_websocket_platform(use_ui=False)

def prepare_payload_from_session(session: Session, default_diagram_type: Optional[str] = None) -> Dict[str, Any]:
    """Extract and cache payload information from the current session event."""
    payload: Dict[str, Any] = {}
    raw_payload = session.get('pending_payload') or {}
    raw_message = session.get('pending_message')
    diagram_hint = session.get('pending_diagram_type')

    if session.event and hasattr(session.event, 'message'):
        event_message = session.event.message
        if isinstance(event_message, str) and event_message.strip().startswith('{'):
            try:
                payload = json.loads(event_message)
            except Exception:
                payload = {}
        else:
            raw_message = event_message or raw_message

    if isinstance(raw_payload, dict) and raw_payload:
        payload = {**payload, **raw_payload} if payload else raw_payload

    message = payload.get('message', raw_message or '')
    diagram_type = payload.get('diagramType') or diagram_hint

    if isinstance(message, str):
        prefix_match = re.match(r'^\[DIAGRAM_TYPE:(\w+)\]\s*(.+)', message)
        if prefix_match:
            diagram_type = diagram_type or prefix_match.group(1)
            message = prefix_match.group(2)

    if not diagram_type and isinstance(message, str):
        diagram_type = extract_diagram_type_from_message(message)
    if not diagram_type and isinstance(message, str):
        diagram_type = detect_diagram_type_from_keywords(message)

    if not diagram_type:
        diagram_type = default_diagram_type or 'ClassDiagram'

    session.set('pending_payload', payload)
    session.set('pending_message', message)
    session.set('pending_diagram_type', diagram_type)

    return {
        'payload': payload,
        'message': message,
        'diagram_type': diagram_type
    }


def store_payload_for_default(session: Session, params: Dict[str, Any]) -> bool:
    """Catch-all condition that caches payload and defaults to provided diagram type."""
    default_type = params.get('default_diagram_type')
    prepare_payload_from_session(session, default_diagram_type=default_type)
    return True


def route_to_modify(session: Session, params: Dict[str, Any]) -> bool:
    """Detect if the JSON payload describes a modification request."""
    info = prepare_payload_from_session(session, default_diagram_type=params.get('default_diagram_type'))
    message = info.get('message') or ''
    return bool(message) and is_modification_request(message)


def route_to_help(session: Session, params: Dict[str, Any]) -> bool:
    """Route to modeling help when the payload lacks clear creation or modification instructions."""
    info = prepare_payload_from_session(session, default_diagram_type=params.get('default_diagram_type'))
    message = (info.get('message') or '').strip()

    if not message:
        return True

    if is_modification_request(message):
        return False

    if is_single_element_request(message) or is_complete_system_request(message):
        return False

    return True


def route_to_create(session: Session, params: Dict[str, Any]) -> bool:
    """Fallback route that treats the payload as a creation request."""
    prepare_payload_from_session(session, default_diagram_type=params.get('default_diagram_type'))
    return True


def clear_cached_payload(session: Session) -> None:
    """Remove any cached payload data after a state has consumed it."""
    for key in ('pending_payload', 'pending_message', 'pending_diagram_type'):
        try:
            session.delete(key)
        except Exception:
            continue

def generate_layout_position(seed: Optional[str] = None) -> Dict[str, int]:
    """Compute a deterministic layout position near the top-left workspace area."""
    rng = random.Random(seed) if seed else random
    x_offset = rng.randint(0, LAYOUT_X_SPREAD)
    y_offset = rng.randint(0, LAYOUT_Y_SPREAD)
    return {
        'x': LAYOUT_BASE_X + x_offset,
        'y': LAYOUT_BASE_Y + y_offset
    }

def is_duplicate_request(session: Session, context: Optional[Dict[str, Any]], state_name: str) -> bool:
    """Detect repeated processing triggered by JSON payload replay for the same request."""
    if not context:
        return False

    actual_message = (context.get('actual_message') or '').strip()
    diagram_type = context.get('diagram_type') or 'ClassDiagram'

    if not actual_message:
        return False

    request_key = f"{state_name}::{diagram_type}::{actual_message}".lower()
    last_key = session.get('last_processed_request')

    if isinstance(session.event, ReceiveJSONEvent) and last_key == request_key:
        logger.info(f"[uml-bot] Skipping duplicate payload replay for {state_name}")
        clear_cached_payload(session)
        return True

    session.set('last_processed_request', request_key)
    return False

try:
    gpt = LLMOpenAI(
        agent=agent,
        name='gpt-4o-mini',
        parameters={
            'temperature': 0.4,
            'max_tokens': 3000
        },
        num_previous_messages=3
    )
    
    if gpt is None:
        raise Exception("LLM initialization returned None")
    
    logger.info("✅ LLM initialized successfully")
    
except Exception as e:
    logger.error(f"❌ Failed to initialize LLM: {e}")
    print("\n" + "="*80)
    print("ERROR: Failed to Initialize OpenAI LLM")
    print("="*80)
    print(f"\nError: {e}")
    print("\nPlease check:")
    print("1. Your OpenAI API key in config.ini (line: nlp.openai.api_key)")
    print("2. The key format should be: sk-proj-... or sk-...")
    print("3. The key has not expired or been revoked")
    print("4. You have credits available in your OpenAI account")
    print("\nGet your key from: https://platform.openai.com/api-keys")
    print("="*80 + "\n")
    exit(1)

gpt_complex = gpt

# Initialize diagram handler factory
diagram_factory = DiagramHandlerFactory(gpt)
logger.info(f"✅ Diagram handlers initialized: {', '.join(diagram_factory.get_supported_types())}")

ic_config = LLMIntentClassifierConfiguration(
    llm_name='gpt-4o-mini',
    parameters={},
    use_intent_descriptions=True,
    use_training_sentences=False,
    use_entity_descriptions=True,
    use_entity_synonyms=False
)

agent.set_default_ic_config(ic_config)

# STATES
greetings_state = agent.new_state('greetings_state', initial=True)
diagram_router_state = agent.new_state('diagram_router_state')
create_model_state = agent.new_state('create_model_state')
modify_model_state = agent.new_state('modify_model_state')
modeling_help_state = agent.new_state('modeling_help_state')

# INTENTS
hello_intent = agent.new_intent(
    name='hello_intent',
    description='The user greets you or wants to start a conversation'
)

create_model_intent = agent.new_intent(
    name='create_model_intent',
    description='The user wants to create any kind of UML model, system, class, diagram, object, state, or agent'
)

modify_model_intent = agent.new_intent(
    name='modify_model_intent',
    description='The user wants to modify, change, update, or edit an existing UML model or element'
)

modeling_help_intent = agent.new_intent(
    name='modeling_help_intent',
    description='The user asks for help with UML modeling, design patterns, or modeling concepts'
)

# Legacy functions for backward compatibility (will be replaced by handlers)

# UML Model Generation Using OpenAI

# Enhanced UML Model Generation Using OpenAI with Model Modification Support

def generate_simple_class_spec(user_request: str) -> Dict[str, Any]:
    """Generate a simple class specification using OpenAI, then convert to Apollon format"""
    
    system_prompt = """You are a UML modeling expert. Create a MINIMAL, focused class specification based on the user's request.

Return ONLY a JSON object with this structure:
{
  "className": "ExactClassName",
  "attributes": [
    {"name": "attributeName", "type": "String", "visibility": "private"},
    {"name": "anotherAttr", "type": "int", "visibility": "private"}
  ],
  "methods": [
    {"name": "methodName", "returnType": "void", "visibility": "public", "parameters": []}
  ]
}

IMPORTANT RULES:
1. Generate 2-4 ESSENTIAL attributes only (not more unless explicitly requested)
2. Generate 0-2 methods ONLY if they make sense for the class (getters/setters are optional)
3. If the user just says "create X class", generate minimal attributes and NO methods unless needed
4. Use proper programming conventions
5. Keep it SIMPLE and focused
6. Return ONLY the JSON, no explanations

Examples:
- "create User class" -> 2-3 attributes (id, name, email), 0-1 method
- "create Product class" -> 2-3 attributes (id, name, price), 0 methods
- "create Order class with payment method" -> 3-4 attributes including paymentMethod, 1 method (processOrder)

Return ONLY the JSON, no explanations."""

    user_prompt = f"Create a class specification for: {user_request}"
    
    try:
        response = gpt.predict(f"{system_prompt}\n\nUser Request: {user_prompt}")
        
        if not response:
            raise Exception("GPT returned empty response")
        
        json_text = response.strip()
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        simple_spec = json.loads(json_text)
        
        apollon_format = convert_simple_to_apollon(simple_spec)
        
        return {
            "action": "inject_element",
            "element": simple_spec,
            "message": f"✅ Successfully created {simple_spec['className']} class with {len(simple_spec.get('attributes', []))} attributes and {len(simple_spec.get('methods', []))} methods!"
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating simple class spec: {e}")
        
        fallback_spec = {
            "className": "NewClass",
            "attributes": [
                {"name": "id", "type": "String", "visibility": "private"}
            ],
            "methods": [
                {"name": "getId", "returnType": "String", "visibility": "public", "parameters": []}
            ]
        }
        return {
            "action": "inject_element",
            "element": fallback_spec,  # Send simple spec directly
            "message": f"✅ Created a basic class (AI generation failed: {str(e)[:100]})"
        }

def generate_model_modification(user_request: str, current_model: Dict[str, Any] = None) -> Dict[str, Any]:
    """Generate model modifications based on user request and current model context"""
    system_prompt = """You are a UML modeling expert. The user wants to modify an existing UML model.

Return ONLY a JSON object with this structure:
{
  "action": "modify_model",
  "modification": {
    "action": "modify_class" | "modify_attribute" | "modify_method" | "add_relationship" | "remove_element",
    "target": {
      "classId": "optional_id",
      "className": "ClassName",
      "attributeId": "optional_attr_id",
      "attributeName": "originalAttributeName",
      "methodId": "optional_method_id",
      "methodName": "originalMethodName",
      "relationshipId": "optional_relationship_id",
      "relationshipName": "existingRelationshipName",
      "sourceClass": "SourceClass",
      "targetClass": "TargetClass"
    },
    "changes": {
      "name": "newName",
      "type": "newType",
      "visibility": "public|private|protected",
      "parameters": [{"name": "param", "type": "String"}],
      "returnType": "ReturnType",
      "sourceMultiplicity": "1",
      "targetMultiplicity": "*",
      "relationshipType": "Association|Aggregation|Composition|Inheritance"
    }
  },
  "message": "Short explanation of what changed"
}

Rules:
1. Only reference classes or elements that exist in the provided model context.
2. When renaming attributes or methods include the ORIGINAL name in target.attributeName/target.methodName.
3. When adding relationships include sourceClass, targetClass, relationshipType, and multiplicities.
4. Prefer ids if provided in the context.
5. Keep the message user-friendly and concise.
6. Do not invent new classes unless the user explicitly asks to add them."""

    context_info = []
    if current_model and isinstance(current_model, dict) and current_model.get('elements'):
        elements = current_model.get('elements', {})
        for element in elements.values():
            if element.get('type') == 'Class':
                name = element.get('name', 'Unknown')
                attr_names = []
                for attr_id in element.get('attributes', []) or []:
                    attr = elements.get(attr_id, {})
                    attr_name = attr.get('name')
                    if attr_name:
                        attr_names.append(attr_name)
                method_names = []
                for method_id in element.get('methods', []) or []:
                    method = elements.get(method_id, {})
                    method_name = method.get('name')
                    if method_name:
                        method_names.append(method_name)
                summary = f"Class {name}"
                if attr_names:
                    summary += f" | attributes: {', '.join(attr_names[:4])}"
                if method_names:
                    summary += f" | methods: {', '.join(method_names[:4])}"
                context_info.append(summary)

    context_block = ''
    if context_info:
        context_block = "\n\nCurrent model summary:\n- " + "\n- ".join(context_info[:8])

    user_prompt = f"Modify the UML model: {user_request}{context_block}"

    try:
        response = gpt.predict(f"{system_prompt}\n\nUser Request: {user_prompt}")

        json_text = response.strip()
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()

        modification_spec = json.loads(json_text)
        if not isinstance(modification_spec, dict):
            raise ValueError("Modification response is not a JSON object")

        modification_spec.setdefault('action', 'modify_model')
        if 'modification' not in modification_spec:
            raise ValueError("Missing modification payload")

        modification_spec.setdefault(
            'message',
            f"Applied {modification_spec['modification'].get('action', 'modification')} to {modification_spec['modification'].get('target', {}).get('className', 'model')}"
        )

        return modification_spec

    except Exception as e:
        logger.error(f"Error generating model modification: {e}")
        return {
            'action': 'modify_model',
            'modification': {
                'action': 'modify_class',
                'target': {'className': 'Unknown'},
                'changes': {'name': 'ModifiedClass'}
            },
            'message': 'Failed to generate modification automatically (fallback used).'
        }


def convert_simple_to_apollon(simple_spec: Dict[str, Any]) -> Dict[str, Any]:
    """Convert simple specification to full Apollon format with guaranteed structure"""
    class_name = simple_spec.get('className', 'NewClass')
    attributes = simple_spec.get('attributes', [])
    methods = simple_spec.get('methods', [])

    class_id = f"class_{uuid.uuid4().hex[:8]}"
    position = generate_layout_position(class_id)
    x_pos = position['x']
    y_pos = position['y']

    attr_height = len(attributes) * ATTRIBUTE_HEIGHT + (10 if attributes else 0)
    method_height = len(methods) * METHOD_HEIGHT + (10 if methods else 0)
    total_height = CLASS_HEADER_HEIGHT + attr_height + method_height

    class_element = {
        "type": "Class",
        "id": class_id,
        "name": class_name,
        "owner": None,
        "bounds": {"x": x_pos, "y": y_pos, "width": CLASS_WIDTH, "height": total_height},
        "attributes": [],
        "methods": []
    }

    attr_elements: Dict[str, Any] = {}
    current_y = y_pos + (CLASS_HEADER_HEIGHT - ATTRIBUTE_HEIGHT)

    for attr in attributes:
        attr_id = f"attr_{uuid.uuid4().hex[:8]}"
        visibility_symbol = "+" if attr.get('visibility') == 'public' else "-"
        attr_name = f"{visibility_symbol} {attr['name']}: {attr.get('type', 'String')}"

        attr_elements[attr_id] = {
            "id": attr_id,
            "name": attr_name,
            "type": "ClassAttribute",
            "owner": class_id,
            "bounds": {"x": x_pos + 1, "y": current_y, "width": CLASS_WIDTH - 2, "height": ATTRIBUTE_HEIGHT}
        }

        class_element["attributes"].append(attr_id)
        current_y += ATTRIBUTE_HEIGHT

    method_elements: Dict[str, Any] = {}
    if attributes:
        current_y += 10

    for method in methods:
        method_id = f"method_{uuid.uuid4().hex[:8]}"
        visibility_symbol = "+" if method.get('visibility') == 'public' else "-"
        params = method.get('parameters', [])
        param_str = ", ".join([f"{p.get('name', 'param')}: {p.get('type', 'String')}" for p in params])
        method_name = f"{visibility_symbol} {method['name']}({param_str}): {method.get('returnType', 'void')}"

        method_elements[method_id] = {
            "id": method_id,
            "name": method_name,
            "type": "ClassMethod",
            "owner": class_id,
            "bounds": {"x": x_pos + 1, "y": current_y, "width": CLASS_WIDTH - 2, "height": METHOD_HEIGHT}
        }

        class_element["methods"].append(method_id)
        current_y += METHOD_HEIGHT

    return {
        "class": class_element,
        "attributes": attr_elements,
        "methods": method_elements
    }

def normalize_apollon_layout(element_data: Dict[str, Any]) -> Dict[str, Any]:
    """Reposition Apollon element data so it appears in the focused top-left workspace region."""
    if not isinstance(element_data, dict):
        return element_data

    class_info = element_data.get("class")
    if not isinstance(class_info, dict):
        return element_data

    class_id = class_info.get("id") or f"class_{uuid.uuid4().hex[:8]}"
    class_info["id"] = class_id

    position = generate_layout_position(class_id)
    x_pos = position['x']
    y_pos = position['y']

    attributes = element_data.get("attributes", {})
    methods = element_data.get("methods", {})

    attr_ids = list(attributes.keys())
    method_ids = list(methods.keys())

    attr_height = len(attr_ids) * ATTRIBUTE_HEIGHT + (10 if attr_ids else 0)
    method_height = len(method_ids) * METHOD_HEIGHT + (10 if method_ids else 0)
    class_info["bounds"] = {
        "x": x_pos,
        "y": y_pos,
        "width": CLASS_WIDTH,
        "height": CLASS_HEADER_HEIGHT + attr_height + method_height
    }

    current_y = y_pos + (CLASS_HEADER_HEIGHT - ATTRIBUTE_HEIGHT)
    for attr_id in attr_ids:
        attr = attributes.get(attr_id, {})
        attr["owner"] = class_id
        attr["bounds"] = {
            "x": x_pos + 1,
            "y": current_y,
            "width": CLASS_WIDTH - 2,
            "height": ATTRIBUTE_HEIGHT
        }
        attributes[attr_id] = attr
        current_y += ATTRIBUTE_HEIGHT

    if attr_ids:
        current_y += 10

    for method_id in method_ids:
        method = methods.get(method_id, {})
        method["owner"] = class_id
        method["bounds"] = {
            "x": x_pos + 1,
            "y": current_y,
            "width": CLASS_WIDTH - 2,
            "height": METHOD_HEIGHT
        }
        methods[method_id] = method
        current_y += METHOD_HEIGHT

    class_info["attributes"] = attr_ids
    class_info["methods"] = method_ids
    element_data["class"] = class_info
    element_data["attributes"] = attributes
    element_data["methods"] = methods

    return element_data

def generate_uml_element_with_ai(user_request: str, element_type: str = "class") -> Dict[str, Any]:
    """Generate a single UML element (class, interface, etc.) using OpenAI in Apollon format"""
    
    if element_type.lower() == "class":
        system_prompt = """You are a UML modeling expert. Generate a single UML class in JSON format based on the user's request.

The JSON should follow this exact Apollon Editor format (ONE SINGLE JSON OBJECT):
{
  "class": {
    "type": "Class",
    "id": "unique_id",
    "name": "ClassName",
    "owner": null,
    "bounds": {"x": 100, "y": 100, "width": 200, "height": 120},
    "attributes": ["attr_id_1", "attr_id_2"],
    "methods": ["method_id_1", "method_id_2"]
  },
  "attributes": {
    "attr_id_1": {
      "id": "attr_id_1",
      "name": "+ attributeName: Type",
      "type": "ClassAttribute",
      "owner": "class_id",
      "bounds": {"x": 101, "y": 130, "width": 198, "height": 30}
    },
    "attr_id_2": {
      "id": "attr_id_2",
      "name": "+ anotherAttr: Type",
      "type": "ClassAttribute",
      "owner": "class_id",
      "bounds": {"x": 101, "y": 160, "width": 198, "height": 30}
    }
  },
  "methods": {
    "method_id_1": {
      "id": "method_id_1", 
      "name": "+ methodName(): ReturnType",
      "type": "ClassMethod",
      "owner": "class_id",
      "bounds": {"x": 101, "y": 190, "width": 198, "height": 30}
    },
    "method_id_2": {
      "id": "method_id_2", 
      "name": "+ anotherMethod(): ReturnType",
      "type": "ClassMethod",
      "owner": "class_id",
      "bounds": {"x": 101, "y": 220, "width": 198, "height": 30}
    }
  }
}

IMPORTANT RULES:
1. Return ONLY ONE JSON object containing class, attributes, and methods
2. Use proper UML notation (+ for public, - for private, # for protected)
3. Include realistic data types (String, int, boolean, Date, etc.)
4. All IDs must be unique UUIDs and consistent throughout
5. The owner field in attributes/methods must match the class id
6. Return ONLY the JSON, no explanations or markdown formatting
7. DO NOT return multiple separate JSON objects"""

    user_prompt = f"Create a UML class for: {user_request}"
    
    try:
        # Get the element from OpenAI
        full_prompt = f"{system_prompt}\n\nUser Request: {user_prompt}"
        response = gpt.predict(full_prompt)
        
        json_text = response.strip()
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        if '}\n\n{' in json_text or '}\n{' in json_text:
            json_parts = json_text.split('}\n')
            if len(json_parts) > 1:
                json_text = json_parts[0] + '}'
        
        element_data = json.loads(json_text)
        
        if 'class' not in element_data and 'type' in element_data:
            class_id = element_data.get('id', str(uuid.uuid4()))
            
            element_data = {
                "class": element_data,
                "attributes": {},
                "methods": {}
            }
        
        if element_data.get("class") and not element_data["class"].get("id"):
            element_data["class"]["id"] = str(uuid.uuid4())
        
        return normalize_apollon_layout(element_data)
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from OpenAI response: {e}")
        logger.error(f"Response was: {response}")
        return generate_fallback_apollon_class(user_request)
    except Exception as e:
        logger.error(f"Error generating element with AI: {e}")
        return generate_fallback_apollon_class(user_request)

def generate_fallback_apollon_class(request: str) -> Dict[str, Any]:
    """Generate a simple fallback class in Apollon format if AI generation fails"""
    class_name = extract_class_name_from_request(request)
    class_id = str(uuid.uuid4())
    attr_id = str(uuid.uuid4())
    method_id = str(uuid.uuid4())
    
    return {
        "class": {
            "type": "Class",
            "id": class_id,
            "name": class_name,
            "owner": None,
            "bounds": {
                "x": LAYOUT_BASE_X,
                "y": LAYOUT_BASE_Y,
                "width": CLASS_WIDTH,
                "height": CLASS_HEADER_HEIGHT + ATTRIBUTE_HEIGHT + METHOD_HEIGHT + 10
            },
            "attributes": [attr_id],
            "methods": [method_id]
        },
        "attributes": {
            attr_id: {
                "id": attr_id,
                "name": "+ id: String",
                "type": "ClassAttribute", 
                "owner": class_id,
                "bounds": {
                    "x": LAYOUT_BASE_X + 1,
                    "y": LAYOUT_BASE_Y + CLASS_HEADER_HEIGHT - ATTRIBUTE_HEIGHT,
                    "width": CLASS_WIDTH - 2,
                    "height": ATTRIBUTE_HEIGHT
                }
            }
        },
        "methods": {
            method_id: {
                "id": method_id,
                "name": "+ getId(): String",
                "type": "ClassMethod",
                "owner": class_id, 
                "bounds": {
                    "x": LAYOUT_BASE_X + 1,
                    "y": LAYOUT_BASE_Y + CLASS_HEADER_HEIGHT + 10,
                    "width": CLASS_WIDTH - 2,
                    "height": METHOD_HEIGHT
                }
            }
        }
    }

def generate_complete_system_with_ai(user_request: str) -> Dict[str, Any]:
    """Generate a simplified complete system specification using OpenAI"""
    
    system_prompt = """You are a UML modeling expert. Create a FOCUSED system specification based on the user's request.

Return ONLY a JSON object with this structure:
{
  "systemName": "SystemName",
  "classes": [
    {
      "className": "User",
      "attributes": [
        {"name": "id", "type": "String", "visibility": "private"},
        {"name": "email", "type": "String", "visibility": "private"}
      ],
      "methods": [
        {"name": "login", "returnType": "boolean", "visibility": "public", "parameters": [{"name": "password", "type": "String"}]}
      ]
    },
    {
      "className": "Product",
      "attributes": [
        {"name": "id", "type": "String", "visibility": "private"},
        {"name": "name", "type": "String", "visibility": "private"},
        {"name": "price", "type": "double", "visibility": "private"}
      ],
      "methods": []
    }
  ],
  "relationships": [
    {
      "type": "Association",
      "sourceClass": "User",
      "targetClass": "Product",
      "sourceMultiplicity": "1",
      "targetMultiplicity": "*",
      "name": "purchases"
    }
  ]
}

IMPORTANT RULES:
1. Generate 2-4 related classes (not more unless explicitly requested)
2. Each class should have 2-4 ESSENTIAL attributes
3. Add methods ONLY when they are critical to the class (0-2 methods per class)
4. Use proper visibility (mostly private for attributes, public for methods)
5. Include 1-3 meaningful relationships between classes
6. Keep the design SIMPLE and focused on core functionality
7. Return ONLY the JSON, no explanations or markdown formatting

Examples of minimal systems:
- "e-commerce" -> User, Product, Order (3 classes)
- "blog system" -> User, Post, Comment (3 classes)  
- "library" -> Book, Member, Loan (3 classes)

Return ONLY the JSON, no explanations."""

    user_prompt = f"Create a complete system specification for: {user_request}"
    
    try:
        # Get the system specification from OpenAI (use complex LLM for systems)
        full_prompt = f"{system_prompt}\n\nUser Request: {user_prompt}"
        response = gpt_complex.predict(full_prompt)
        
        json_text = response.strip()
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        system_spec = json.loads(json_text)
        
        return {
            "action": "inject_complete_system",
            "systemSpec": system_spec,
            "message": f"✨ **Created {system_spec.get('systemName', 'your')} system!**\n\n🏗️ Generated:\n• {len(system_spec.get('classes', []))} classes\n• {len(system_spec.get('relationships', []))} relationship(s)\n\n🎯 The complete system has been automatically injected into your editor!"
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from OpenAI response: {e}")
        
        try:
            if json_text.count('{') > json_text.count('}'):
                missing_braces = json_text.count('{') - json_text.count('}')
                repaired_json = json_text + '}' * missing_braces
                system_spec = json.loads(repaired_json)
                
                return {
                    "action": "inject_complete_system",
                    "systemSpec": system_spec,
                    "message": f"✨ **Created your system!**\n\n🏗️ Generated:\n• {len(system_spec.get('classes', []))} classes\n• {len(system_spec.get('relationships', []))} relationship(s)"
                }
            else:
                raise Exception("Cannot repair JSON")
        except Exception as repair_error:
            logger.error(f"Failed to repair JSON: {repair_error}")
            return generate_fallback_system_spec(user_request)
        
    except Exception as e:
        logger.error(f"Error generating system with AI: {e}")
        return generate_fallback_system_spec(user_request)

def generate_fallback_system_spec(request: str) -> Dict[str, Any]:
    """Generate a simple fallback system specification if AI generation fails"""
    class_name = extract_class_name_from_request(request)
    
    fallback_spec = {
        "systemName": f"{class_name}System",
        "classes": [
            {
                "className": class_name,
                "attributes": [
                    {"name": "id", "type": "String", "visibility": "private"}
                ],
                "methods": [
                    {"name": "getId", "returnType": "String", "visibility": "public", "parameters": []}
                ]
            }
        ],
        "relationships": []
    }
    
    return {
        "action": "inject_complete_system",
        "systemSpec": fallback_spec,
        "message": f"✅ Created a basic {class_name} system (AI generation failed, used fallback)"
    }

def generate_fallback_system_model(request: str) -> Dict[str, Any]:
    """Generate a simple fallback system model if AI generation fails"""
    class_name = extract_class_name_from_request(request)
    
    class_id = f"class_{uuid.uuid4().hex[:8]}"
    attr_id = f"attr_{uuid.uuid4().hex[:8]}"
    method_id = f"method_{uuid.uuid4().hex[:8]}"
    
    return {
        "version": "3.0.0",
        "type": "ClassDiagram",
        "size": {"width": 1400, "height": 740},
        "elements": {
            class_id: {
                "type": "Class",
                "id": class_id,
                "name": class_name,
                "owner": None,
                "bounds": {"x": 200, "y": 200, "width": 220, "height": 120},
                "attributes": [attr_id],
                "methods": [method_id]
            },
            attr_id: {
                "id": attr_id,
                "name": "+ id: String",
                "type": "ClassAttribute",
                "owner": class_id,
                "bounds": {"x": 201, "y": 250, "width": 218, "height": 25}
            },
            method_id: {
                "id": method_id,
                "name": "+ getId(): String",
                "type": "ClassMethod",
                "owner": class_id,
                "bounds": {"x": 201, "y": 285, "width": 218, "height": 25}
            }
        },
        "relationships": {},
        "interactive": {"elements": {}, "relationships": {}},
        "assessments": {}
    }

def extract_class_name_from_request(request: str) -> str:
    """Extract a class name from the user request"""
    # Simple extraction - look for common patterns
    words = request.lower().split()
    
    # Look for patterns like "create X class" or "add X"
    for i, word in enumerate(words):
        if word in ['class', 'model', 'system'] and i > 0:
            return words[i-1].capitalize()
    
    # Look for nouns that could be class names
    common_class_words = ['user', 'customer', 'product', 'order', 'book', 'person', 'student', 'employee']
    for word in words:
        if word in common_class_words:
            return word.capitalize()
    
    return "MyClass"

# STATE BODY DEFINITIONS

def global_fallback_body(session: Session):
    user_message = session.event.message or ""
    
    # Simple processing - no JSON context mode
    logger.info(f"🔍 SIMPLE: Processing message: '{user_message[:100]}...'")
    
    # Use OpenAI to provide helpful responses
    answer = gpt.predict(f"You are a UML modeling assistant. The user said: '{user_message}'. If this is related to UML modeling, suggest how you can help them create models, classes, or diagrams. Otherwise, politely explain that you specialize in UML modeling assistance.")
    
    session.reply(answer)

agent.set_global_fallback_body(global_fallback_body)

def greetings_body(session: Session):
    # Simple greeting - only send once per session to avoid double greetings
    if session.get('has_greeted'):
        return

    if hasattr(session, 'event') and session.event is not None:
        if getattr(session.event, 'human', True) is False:
            return

    greeting_message = """Hello! I'm your UML Assistant!

I can help you:
- Create classes: "Create a User class"
- Build systems: "Create a library management system"
- Create agent diagrams: "Create a agent"
- Modify diagrams: "Add transition from welcome to menu"

What would you like to create?"""

    session.reply(greeting_message)
    session.set('has_greeted', True)


greetings_state.set_body(greetings_body)

# Transitions from greetings state
greetings_state.when_intent_matched(hello_intent).go_to(greetings_state)
greetings_state.when_intent_matched(create_model_intent).go_to(create_model_state)
greetings_state.when_intent_matched(modify_model_intent).go_to(modify_model_state)
greetings_state.when_intent_matched(modeling_help_intent).go_to(modeling_help_state)
greetings_state.when_event(ReceiveJSONEvent())\
    .with_condition(store_payload_for_default, {'default_diagram_type': 'ClassDiagram'})\
    .go_to(diagram_router_state)
greetings_state.when_no_intent_matched().go_to(modeling_help_state)

def diagram_router_body(session: Session):
    logger.info("[uml-bot] Routing payload based on diagram type and request intent")

diagram_router_state.set_body(diagram_router_body)

diagram_router_state.when_condition(route_to_modify, {'default_diagram_type': 'ClassDiagram'})\
    .go_to(modify_model_state)
diagram_router_state.when_condition(route_to_help, {'default_diagram_type': 'ClassDiagram'})\
    .go_to(modeling_help_state)
diagram_router_state.when_condition(route_to_create, {'default_diagram_type': 'ClassDiagram'})\
    .go_to(create_model_state)

def extract_modeling_context(session: Session) -> Optional[Dict[str, Any]]:
    """Normalize request data for the specialized modeling states."""
    if not session.event or not hasattr(session.event, 'message'):
        logger.info("[uml-bot] Using cached payload for automatic transition")
        user_message = ""
    else:
        user_message = session.event.message or ""

    cached_payload = session.get('pending_payload')
    cached_message = session.get('pending_message')
    cached_diagram_type = session.get('pending_diagram_type')

    log_snippet = user_message or (cached_message or "")
    logger.info(f"[uml-bot] RAW MESSAGE: {log_snippet[:200]}")

    diagram_type: Optional[str] = None
    actual_message = user_message
    payload_data: Optional[Dict[str, Any]] = None

    prefix_match = re.match(r'^\[DIAGRAM_TYPE:(\w+)\]\s*(.+)', user_message)
    if prefix_match:
        diagram_type = prefix_match.group(1)
        actual_message = prefix_match.group(2)
        logger.info(f"[uml-bot] Diagram type from prefix: {diagram_type}, message: {actual_message}")

    if hasattr(session.event, 'data') and isinstance(session.event.data, dict):
        if not diagram_type:
            diagram_type = session.event.data.get('diagramType')
            if diagram_type:
                logger.info(f"[uml-bot] Diagram type from event.data: {diagram_type}")
        if not payload_data:
            payload_candidate = session.event.data.get('message')
            if isinstance(payload_candidate, (dict, list)):
                payload_data = payload_candidate
            elif isinstance(payload_candidate, str) and payload_candidate.strip().startswith('{'):
                try:
                    payload_data = json.loads(payload_candidate)
                except Exception:
                    payload_data = None

    if user_message.strip().startswith('{'):
        try:
            payload_data = json.loads(user_message)
        except Exception:
            payload_data = None

    if payload_data and isinstance(payload_data, dict):
        actual_message = payload_data.get('message', actual_message)
        if not diagram_type:
            diagram_type = payload_data.get('diagramType')
            if diagram_type:
                logger.info(f"[uml-bot] Diagram type from payload: {diagram_type}")
        if isinstance(actual_message, str):
            payload_prefix_match = re.match(r'^\[DIAGRAM_TYPE:(\w+)\]\s*(.+)', actual_message)
            if payload_prefix_match:
                if not diagram_type:
                    diagram_type = payload_prefix_match.group(1)
                    logger.info(f"[uml-bot] Diagram type from payload prefix: {diagram_type}")
                actual_message = payload_prefix_match.group(2)

    if not payload_data and isinstance(cached_payload, dict):
        payload_data = cached_payload

    if not actual_message.strip() and hasattr(session.event, 'data') and isinstance(session.event.data, dict):
        actual_message = session.event.data.get('message', actual_message) or actual_message

    if not actual_message.strip() and isinstance(cached_message, str):
        actual_message = cached_message

    if not diagram_type:
        diagram_type = extract_diagram_type_from_message(user_message)
        if diagram_type:
            logger.info(f"[uml-bot] Diagram type from extract: {diagram_type}")

    if not diagram_type and actual_message:
        diagram_type = extract_diagram_type_from_message(actual_message)
        if diagram_type:
            logger.info(f"[uml-bot] Diagram type from actual message: {diagram_type}")

    if not diagram_type and cached_diagram_type:
        diagram_type = cached_diagram_type

    if not diagram_type:
        diagram_type = detect_diagram_type_from_keywords(actual_message)
        if diagram_type:
            logger.info(f"[uml-bot] Diagram type from keywords: {diagram_type}")

    if not diagram_type:
        diagram_type = 'ClassDiagram'

    current_model = None
    if payload_data and isinstance(payload_data, dict):
        current_model = payload_data.get('currentModel')

    if not current_model and hasattr(session.event, 'data') and isinstance(session.event.data, dict):
        current_model = session.event.data.get('currentModel')

    diagram_info = get_diagram_type_info(diagram_type)
    handler = diagram_factory.get_handler(diagram_type)
    logger.info(f"[uml-bot] CONTEXT: Using {diagram_type} via {handler.__class__.__name__ if handler else 'None'}")

    return {
        'user_message': user_message,
        'actual_message': actual_message,
        'diagram_type': diagram_type,
        'payload_data': payload_data,
        'current_model': current_model,
        'diagram_info': diagram_info,
        'handler': handler
    }

def create_modeling_body(session: Session):
    """Generate new UML content based on the user's request."""
    context = extract_modeling_context(session)
    if not context:
        return
    if is_duplicate_request(session, context, 'create'):
        return

    handler = context['handler']
    diagram_type = context['diagram_type']
    actual_message = context['actual_message']

    if not handler:
        session.reply(f"Warning: {diagram_type} is not supported yet. Please use ClassDiagram for now.")
        return

    try:
        if is_complete_system_request(actual_message):
            logger.info("[uml-bot] CREATE: Detected complete system request")
            result = handler.generate_complete_system(actual_message)

            if result and result.get('systemSpec'):
                result['diagramType'] = diagram_type
                session.reply(json.dumps(result))
            else:
                session.reply("I had trouble generating that system. Could you provide more details?")

        elif is_single_element_request(actual_message):
            logger.info("[uml-bot] CREATE: Detected single element request")
            result = handler.generate_single_element(actual_message)

            if result and result.get('element'):
                result['diagramType'] = diagram_type
                session.reply(json.dumps(result))
            else:
                session.reply("I had trouble creating that element. Could you provide more details?")

        else:
            logger.info("[uml-bot] CREATE: Request needs clarification")
            session.reply("I can generate a UML model for you. Describe the system or elements you need and I'll send back the JSON.")

    except Exception as e:
        logger.error(f"Error in create_modeling_body: {e}")
        session.reply("I encountered an issue while creating the model. Could you try rephrasing your request?")
    finally:
        clear_cached_payload(session)

create_model_state.set_body(create_modeling_body)

def modify_modeling_body(session: Session):
    """Apply modifications to an existing UML model."""
    context = extract_modeling_context(session)
    if not context:
        return
    if is_duplicate_request(session, context, 'modify'):
        return

    handler = context['handler']
    diagram_type = context['diagram_type']
    actual_message = context['actual_message']
    current_model = context['current_model']

    if not handler:
        session.reply(f"Warning: {diagram_type} is not supported yet. Please use ClassDiagram for now.")
        return

    try:
        modification_spec = generate_model_modification(actual_message, current_model)

        if modification_spec and modification_spec.get('modification'):
            modification_spec['diagramType'] = diagram_type
            session.reply(json.dumps(modification_spec))
        else:
            session.reply("I couldn't determine the modification to apply. Could you provide more detail?")

    except Exception as e:
        logger.error(f"Error in modify_modeling_body: {e}")
        session.reply("I encountered an issue while updating the model. Could you try rephrasing your request?")
    finally:
        clear_cached_payload(session)

modify_model_state.set_body(modify_modeling_body)

def modeling_help_body(session: Session):
    """Offer guidance or clarifying questions when the user needs modeling help."""
    context = extract_modeling_context(session)
    if not context:
        return
    if is_duplicate_request(session, context, 'help'):
        return

    diagram_info = context['diagram_info']
    actual_message = context['actual_message']

    help_prompt = f"""You are a UML modeling expert assistant working with {diagram_info['name']}. The user asked: "{actual_message}"

Current diagram type: {diagram_info['name']} - {diagram_info['description']}

Provide helpful, practical advice about UML modeling for this diagram type. If they're asking about concepts, explain them clearly. If they want to create something, guide them on how to express their requirements.

Keep your response conversational and encouraging. Suggest specific things they can ask you to create."""

    try:
        answer = gpt.predict(help_prompt)
        session.reply(answer)
    except Exception as e:
        logger.error(f"Error in modeling_help_body: {e}")
        session.reply("I encountered an issue while preparing guidance. Could you try again?")
    finally:
        clear_cached_payload(session)

modeling_help_state.set_body(modeling_help_body)

# Transitions from create state
create_model_state.when_intent_matched(create_model_intent).go_to(create_model_state)
create_model_state.when_intent_matched(modify_model_intent).go_to(modify_model_state)
create_model_state.when_intent_matched(modeling_help_intent).go_to(modeling_help_state)
create_model_state.when_intent_matched(hello_intent).go_to(greetings_state)
create_model_state.when_event(ReceiveJSONEvent())\
    .with_condition(store_payload_for_default, {'default_diagram_type': 'ClassDiagram'})\
    .go_to(diagram_router_state)
create_model_state.when_no_intent_matched().go_to(create_model_state)

# Transitions from modify state
modify_model_state.when_intent_matched(create_model_intent).go_to(create_model_state)
modify_model_state.when_intent_matched(modify_model_intent).go_to(modify_model_state)
modify_model_state.when_intent_matched(modeling_help_intent).go_to(modeling_help_state)
modify_model_state.when_intent_matched(hello_intent).go_to(greetings_state)
modify_model_state.when_event(ReceiveJSONEvent())\
    .with_condition(store_payload_for_default, {'default_diagram_type': 'ClassDiagram'})\
    .go_to(diagram_router_state)
modify_model_state.when_no_intent_matched().go_to(modify_model_state)

# Transitions from modeling help state
modeling_help_state.when_intent_matched(create_model_intent).go_to(create_model_state)
modeling_help_state.when_intent_matched(modify_model_intent).go_to(modify_model_state)
modeling_help_state.when_intent_matched(modeling_help_intent).go_to(modeling_help_state)
modeling_help_state.when_intent_matched(hello_intent).go_to(greetings_state)
modeling_help_state.when_event(ReceiveJSONEvent())\
    .with_condition(store_payload_for_default, {'default_diagram_type': 'ClassDiagram'})\
    .go_to(diagram_router_state)
modeling_help_state.when_no_intent_matched().go_to(modeling_help_state)


# No automatic return to greetings - specialized states maintain context

# RUN APPLICATION
if __name__ == '__main__':
    agent.run()
