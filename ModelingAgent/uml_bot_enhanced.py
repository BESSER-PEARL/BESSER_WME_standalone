# Intelligent UML Modeling Assistant Bot
# This bot uses OpenAI to understand and create any UML model based on natural language
# Supports: ClassDiagram, ObjectDiagram, StateMachineDiagram, AgentDiagram

import logging
import json
import uuid
import re
from typing import Dict, Any, List, Optional

from besser.agent.core.agent import Agent
from besser.agent.core.session import Session
from besser.agent.exceptions.logger import logger
from besser.agent.nlp.intent_classifier.intent_classifier_configuration import LLMIntentClassifierConfiguration
from besser.agent.nlp.llm.llm_openai_api import LLMOpenAI

from diagram_handlers.factory import DiagramHandlerFactory, get_diagram_type_info
from diagram_handlers.utils import extract_diagram_type_from_message, is_single_element_request, is_complete_system_request

# Configure the logging module
logger.setLevel(logging.INFO)

# Create the agent
agent = Agent('uml_modeling_agent')

agent.load_properties('config.ini')

websocket_platform = agent.use_websocket_platform(use_ui=False)

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
modeling_state = agent.new_state('modeling_state')

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

Based on the user's request and the current model context, generate a modification specification.

Return ONLY a JSON object with this structure:
{
  "action": "modify_model",
  "modification": {
    "action": "modify_class" | "modify_attribute" | "modify_method" | "add_relationship" | "remove_element",
    "target": {
      "classId": "optional_id",
      "className": "ClassName",
      "attributeId": "optional_attr_id",
      "methodId": "optional_method_id"
    },
    "changes": {
      "name": "newName",
      "type": "newType", 
      "visibility": "public|private|protected",
      "parameters": [{"name": "param", "type": "String"}],
      "returnType": "ReturnType"
    }
  },
  "message": "Explanation of what was modified"
}

Examples of modifications:
- "Change the name of User class to Customer" -> modify_class
- "Make the email attribute in User class public" -> modify_attribute  
- "Add a password parameter to the login method" -> modify_method
- "Remove the Product class" -> remove_element

Return ONLY the JSON, no explanations."""

    # Include current model context if available
    context_info = ""
    if current_model and current_model.get('elements'):
        classes = []
        for element_id, element in current_model['elements'].items():
            if element.get('type') == 'Class':
                classes.append(element.get('name', 'Unknown'))
        
        if classes:
            context_info = f"\n\nCurrent model contains these classes: {', '.join(classes)}"

    user_prompt = f"Modify the UML model: {user_request}{context_info}"
    
    try:
        response = gpt.predict(f"{system_prompt}\n\nUser Request: {user_prompt}")
        
        json_text = response.strip()
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        modification_spec = json.loads(json_text)
        
        return modification_spec
        
    except Exception as e:
        print(f"❌ Error generating model modification: {e}")
        return {
            "action": "modify_model",
            "modification": {
                "action": "modify_class",
                "target": {"className": "Unknown"},
                "changes": {"name": "ModifiedClass"}
            },
            "message": "❌ Failed to generate modification (used fallback)"
        }

def convert_simple_to_apollon(simple_spec: Dict[str, Any]) -> Dict[str, Any]:
    """Convert simple specification to full Apollon format with guaranteed structure"""
    import uuid
    import random
    
    class_name = simple_spec.get('className', 'NewClass')
    attributes = simple_spec.get('attributes', [])
    methods = simple_spec.get('methods', [])
    
    # Generate unique IDs
    class_id = f"class_{uuid.uuid4().hex[:8]}"
    
    # Random position to avoid overlap
    x_pos = random.randint(50, 400)
    y_pos = random.randint(50, 300)
    
    # Calculate class height based on content
    base_height = 60  # Header
    attr_height = len(attributes) * 25 + (10 if attributes else 0)
    method_height = len(methods) * 25 + (10 if methods else 0)
    total_height = base_height + attr_height + method_height
    
    # Create class element
    class_element = {
        "type": "Class",
        "id": class_id,
        "name": class_name,
        "owner": None,
        "bounds": {"x": x_pos, "y": y_pos, "width": 220, "height": total_height},
        "attributes": [],
        "methods": []
    }
    
    # Create attributes
    attr_elements = {}
    current_y = y_pos + 50  # Start below class header
    
    for i, attr in enumerate(attributes):
        attr_id = f"attr_{uuid.uuid4().hex[:8]}"
        visibility_symbol = "+" if attr.get('visibility') == 'public' else "-"
        attr_name = f"{visibility_symbol} {attr['name']}: {attr.get('type', 'String')}"
        
        attr_elements[attr_id] = {
            "id": attr_id,
            "name": attr_name,
            "type": "ClassAttribute",
            "owner": class_id,
            "bounds": {"x": x_pos + 1, "y": current_y, "width": 218, "height": 25}
        }
        
        class_element["attributes"].append(attr_id)
        current_y += 25
    
    # Create methods
    method_elements = {}
    if attributes:  # Add spacing if there are attributes
        current_y += 10
        
    for i, method in enumerate(methods):
        method_id = f"method_{uuid.uuid4().hex[:8]}"
        visibility_symbol = "+" if method.get('visibility') == 'public' else "-"
        
        # Build parameter string
        params = method.get('parameters', [])
        param_str = ", ".join([f"{p.get('name', 'param')}: {p.get('type', 'String')}" for p in params])
        
        method_name = f"{visibility_symbol} {method['name']}({param_str}): {method.get('returnType', 'void')}"
        
        method_elements[method_id] = {
            "id": method_id,
            "name": method_name,
            "type": "ClassMethod",
            "owner": class_id,
            "bounds": {"x": x_pos + 1, "y": current_y, "width": 218, "height": 25}
        }
        
        class_element["methods"].append(method_id)
        current_y += 25
    
    return {
        "class": class_element,
        "attributes": attr_elements,
        "methods": method_elements
    }

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
        
        return element_data
        
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
            "bounds": {"x": 100, "y": 100, "width": 200, "height": 120},
            "attributes": [attr_id],
            "methods": [method_id]
        },
        "attributes": {
            attr_id: {
                "id": attr_id,
                "name": "+ id: String",
                "type": "ClassAttribute", 
                "owner": class_id,
                "bounds": {"x": 101, "y": 130, "width": 198, "height": 30}
            }
        },
        "methods": {
            method_id: {
                "id": method_id,
                "name": "+ getId(): String",
                "type": "ClassMethod",
                "owner": class_id, 
                "bounds": {"x": 101, "y": 160, "width": 198, "height": 30}
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
    user_message = session.event.message
    
    # Simple processing - no JSON context mode
    logger.info(f"🔍 SIMPLE: Processing message: '{user_message[:100]}...'")
    
    # Use OpenAI to provide helpful responses
    answer = gpt.predict(f"You are a UML modeling assistant. The user said: '{user_message}'. If this is related to UML modeling, suggest how you can help them create models, classes, or diagrams. Otherwise, politely explain that you specialize in UML modeling assistance.")
    
    session.reply(answer)

agent.set_global_fallback_body(global_fallback_body)

def greetings_body(session: Session):
    # Simple greeting - only send once per session
    if not session.get('has_greeted'):
        greeting_message = """Hello! I'm your UML Assistant! 🎨

I can help you:
• Add single classes: "Add a User class"
• Create complete systems: "Create an e-commerce system"
• Build multiple classes: "Add User, Product, and Order classes"

What would you like to create?"""
        
        session.reply(greeting_message)
        session.set('has_greeted', True)

greetings_state.set_body(greetings_body)

# Transitions from greetings state
greetings_state.when_intent_matched(hello_intent).go_to(greetings_state)
greetings_state.when_intent_matched(create_model_intent).go_to(modeling_state)
greetings_state.when_intent_matched(modify_model_intent).go_to(modeling_state)
greetings_state.when_intent_matched(modeling_help_intent).go_to(modeling_state)

def modeling_body(session: Session):
    """Main modeling logic using diagram handlers"""
    import json
    import re
    user_message = session.event.message
    
    logger.info(f"📥 RAW MESSAGE: {user_message[:200]}")  # Debug: see raw message
    
    # Check if we have access to the full event data
    diagram_type = None
    actual_message = user_message
    
    # Try to extract diagram type from [DIAGRAM_TYPE:XXX] prefix
    prefix_match = re.match(r'^\[DIAGRAM_TYPE:(\w+)\]\s*(.+)', user_message)
    if prefix_match:
        diagram_type = prefix_match.group(1)
        actual_message = prefix_match.group(2)  # Remove prefix from actual message
        logger.info(f"📍 Diagram type from prefix: {diagram_type}, message: {actual_message}")
    
    # Try to get diagramType from session event if available
    if not diagram_type and hasattr(session.event, 'data') and isinstance(session.event.data, dict):
        diagram_type = session.event.data.get('diagramType')
        logger.info(f"📍 Diagram type from event.data: {diagram_type}")
    
    # Try to extract from message if it's JSON
    if not diagram_type:
        diagram_type = extract_diagram_type_from_message(user_message)
        logger.info(f"📍 Diagram type from payload: {diagram_type}")
        
        # If JSON, also extract actual message
        if diagram_type:
            try:
                if user_message.strip().startswith('{'):
                    payload = json.loads(user_message)
                    actual_message = payload.get('message', user_message)
            except:
                pass
    
    # If still not found, try keyword detection on the actual message
    if not diagram_type:
        from diagram_handlers.utils import detect_diagram_type_from_keywords
        diagram_type = detect_diagram_type_from_keywords(actual_message)
        logger.info(f"📍 Diagram type from keywords: {diagram_type}")
    
    # Default to ClassDiagram
    if not diagram_type:
        diagram_type = 'ClassDiagram'
    
    diagram_info = get_diagram_type_info(diagram_type)
    
    logger.info(f"🎯 MODELING: Processing '{actual_message[:50]}...' for {diagram_type}")
    
    try:
        # Get the appropriate handler for this diagram type
        handler = diagram_factory.get_handler(diagram_type)
        
        if not handler:
            session.reply(f"⚠️ {diagram_type} is not supported yet. Please use ClassDiagram for now.")
            return
        
        # Check if user wants a complete system first (takes priority)
        if is_complete_system_request(actual_message):
            logger.info("📦 Detected: Complete system request")
            result = handler.generate_complete_system(actual_message)
            
            if result and result.get('systemSpec'):
                result['diagramType'] = diagram_type
                session.reply(json.dumps(result))
            else:
                session.reply("I had trouble generating that system. Could you provide more details?")
        
        # Then check for single element requests
        elif is_single_element_request(actual_message):
            logger.info("➕ Detected: Single element request")
            result = handler.generate_single_element(actual_message)
            
            if result and result.get('element'):
                result['diagramType'] = diagram_type
                session.reply(json.dumps(result))
            else:
                session.reply("I had trouble creating that element. Could you provide more details?")
        
        # Otherwise provide help/guidance
        else:
            help_prompt = f"""You are a UML modeling expert assistant working with {diagram_info['name']}. The user asked: "{actual_message}"

Current diagram type: {diagram_info['name']} - {diagram_info['description']}

Provide helpful, practical advice about UML modeling for this diagram type. If they're asking about concepts, explain them clearly. If they want to create something, guide them on how to express their requirements.

Keep your response conversational and encouraging. Suggest specific things they can ask you to create."""
            
            answer = gpt.predict(help_prompt)
            session.reply(answer)
            
    except Exception as e:
        logger.error(f"Error in modeling_body: {e}")
        session.reply("I encountered an issue. Could you please try rephrasing your request?")

modeling_state.set_body(modeling_body)

# Transitions from modeling state
modeling_state.when_intent_matched(create_model_intent).go_to(modeling_state)
modeling_state.when_intent_matched(modify_model_intent).go_to(modeling_state)
modeling_state.when_intent_matched(modeling_help_intent).go_to(modeling_state)
modeling_state.when_intent_matched(hello_intent).go_to(greetings_state)

# Return to greetings after handling a request
modeling_state.go_to(greetings_state)

# RUN APPLICATION
if __name__ == '__main__':
    agent.run()
