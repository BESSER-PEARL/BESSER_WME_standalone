# Intelligent UML Modeling Assistant Bot
# This bot uses OpenAI to understand and create any UML model based on natural language

import logging
import json
import uuid
import re
from typing import Dict, Any, List

from besser.agent.core.agent import Agent
from besser.agent.core.session import Session
from besser.agent.exceptions.logger import logger
from besser.agent.nlp.intent_classifier.intent_classifier_configuration import LLMIntentClassifierConfiguration
from besser.agent.nlp.llm.llm_openai_api import LLMOpenAI

# Configure the logging module
logger.setLevel(logging.INFO)

# Create the agent
agent = Agent('uml_modeling_agent')

# Load agent properties stored in a dedicated file
agent.load_properties('config.ini')

# Define the platform your agent will use
websocket_platform = agent.use_websocket_platform(use_ui=False)

# Note: We'll handle context messages through the standard message flow
# The frontend will format context messages appropriately

# Create the LLM with enhanced parameters for better model generation
gpt = LLMOpenAI(
    agent=agent,
    name='gpt-4o-mini',
    parameters={
        'temperature': 0.7,
        'max_tokens': 4000  # Increased for complete systems
    },
    num_previous_messages=5
)

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
    description='The user wants to create any kind of UML model, system, class, or diagram'
)

modify_model_intent = agent.new_intent(
    name='modify_model_intent',
    description='The user wants to modify, change, update, or edit an existing UML model or element'
)

modeling_help_intent = agent.new_intent(
    name='modeling_help_intent',
    description='The user asks for help with UML modeling, design patterns, or modeling concepts'
)

# UML Model Generation Using OpenAI

# Enhanced UML Model Generation Using OpenAI with Model Modification Support

def generate_simple_class_spec(user_request: str) -> Dict[str, Any]:
    """Generate a simple class specification using OpenAI, then convert to Apollon format"""
    
    system_prompt = """You are a UML modeling expert. Create a simple class specification based on the user's request.

Return ONLY a JSON object with this structure:
{
  "className": "ExactClassName",
  "attributes": [
    {"name": "attributeName", "type": "String", "visibility": "private"},
    {"name": "anotherAttr", "type": "int", "visibility": "public"}
  ],
  "methods": [
    {"name": "methodName", "returnType": "void", "visibility": "public", "parameters": []},
    {"name": "getName", "returnType": "String", "visibility": "public", "parameters": []}
  ]
}

Generate realistic and useful attributes and methods. Use proper programming conventions.
Return ONLY the JSON, no explanations."""

    user_prompt = f"Create a class specification for: {user_request}"
    
    try:
        response = gpt.predict(f"{system_prompt}\n\nUser Request: {user_prompt}")
        
        # Clean the response
        json_text = response.strip()
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        # Parse the simple specification
        simple_spec = json.loads(json_text)
        
        # Convert to Apollon format using our converter
        apollon_format = convert_simple_to_apollon(simple_spec)
        
        return {
            "action": "inject_element",
            "element": simple_spec,  # Send the simple spec directly to frontend
            "message": f"✅ Successfully created {simple_spec['className']} class with {len(simple_spec.get('attributes', []))} attributes and {len(simple_spec.get('methods', []))} methods!"
        }
        
    except Exception as e:
        print(f"❌ Error generating simple class spec: {e}")
        # Return a simple fallback class
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
            "message": "✅ Created a basic class (AI generation failed, used fallback)"
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
        
        # Clean the response
        json_text = response.strip()
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        # Parse the modification specification
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
        
        # Clean the response - remove any markdown formatting
        json_text = response.strip()
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        # Handle multiple JSON objects by taking only the first one
        if '}\n\n{' in json_text or '}\n{' in json_text:
            # Split and take the first JSON object
            json_parts = json_text.split('}\n')
            if len(json_parts) > 1:
                json_text = json_parts[0] + '}'
        
        # Parse and validate the JSON
        element_data = json.loads(json_text)
        
        # If OpenAI still returned separate objects, combine them
        if 'class' not in element_data and 'type' in element_data:
            # This means we got the old format - convert to new format
            class_id = element_data.get('id', str(uuid.uuid4()))
            
            # Create a simple combined structure
            element_data = {
                "class": element_data,
                "attributes": {},
                "methods": {}
            }
        
        # Ensure the element has a unique UUID
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
    
    system_prompt = """You are a UML modeling expert. Create a simplified system specification based on the user's request.

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
        {"name": "login", "returnType": "boolean", "visibility": "public", "parameters": [{"name": "password", "type": "String"}]},
        {"name": "getId", "returnType": "String", "visibility": "public", "parameters": []}
      ]
    },
    {
      "className": "Product",
      "attributes": [
        {"name": "id", "type": "String", "visibility": "private"},
        {"name": "name", "type": "String", "visibility": "private"}
      ],
      "methods": [
        {"name": "getName", "returnType": "String", "visibility": "public", "parameters": []}
      ]
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
1. Generate 2-5 related classes for the requested system
2. Include realistic attributes and methods with proper types
3. Use proper visibility (private, public, protected)
4. Include meaningful relationships (Association, Inheritance, Composition, Aggregation)
5. Use realistic system design patterns
6. Return ONLY the JSON, no explanations or markdown formatting"""

    user_prompt = f"Create a complete system specification for: {user_request}"
    
    try:
        # Get the system specification from OpenAI
        full_prompt = f"{system_prompt}\n\nUser Request: {user_prompt}"
        response = gpt.predict(full_prompt)
        
        # Clean the response - remove any markdown formatting
        json_text = response.strip()
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        # Parse the simplified system specification
        system_spec = json.loads(json_text)
        
        return {
            "action": "inject_complete_system",
            "systemSpec": system_spec,  # Send simplified spec to frontend
            "message": f"✨ **Created {system_spec.get('systemName', 'your')} system!**\n\n🏗️ Generated:\n• {len(system_spec.get('classes', []))} classes\n• {len(system_spec.get('relationships', []))} relationship(s)\n\n🎯 The complete system has been automatically injected into your editor!"
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from OpenAI response: {e}")
        logger.error(f"Response was: {response}")
        
        # Try to repair the JSON by adding missing closing braces
        try:
            if json_text.count('{') > json_text.count('}'):
                missing_braces = json_text.count('{') - json_text.count('}')
                repaired_json = json_text + '}' * missing_braces
                logger.info(f"Attempting to repair JSON by adding {missing_braces} closing braces")
                system_spec = json.loads(repaired_json)
                logger.info("✅ Successfully repaired and parsed JSON!")
                
                return {
                    "action": "inject_complete_system",
                    "systemSpec": system_spec,
                    "message": f"✨ **Created your system!** (recovered from parsing error)\n\n🏗️ Generated:\n• {len(system_spec.get('classes', []))} classes\n• {len(system_spec.get('relationships', []))} relationship(s)\n\n🎯 The complete system has been automatically injected into your editor!"
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
    # Simple greeting - no complex context handling
    if not hasattr(session, 'has_greeted'):
        greeting_message = """Hello! I'm your UML Assistant! 🎨

I can help you:
• Add single classes: "Add a User class"
• Create complete systems: "Create an e-commerce system"
• Build multiple classes: "Add User, Product, and Order classes"

What would you like to create?"""
        
        session.reply(greeting_message)
        session.has_greeted = True

greetings_state.set_body(greetings_body)

# Transitions from greetings state
greetings_state.when_intent_matched(hello_intent).go_to(greetings_state)
greetings_state.when_intent_matched(create_model_intent).go_to(modeling_state)
greetings_state.when_intent_matched(modify_model_intent).go_to(modeling_state)
greetings_state.when_intent_matched(modeling_help_intent).go_to(modeling_state)

def modeling_body(session: Session):
    import json  # Import json at the beginning of the function
    user_message = session.event.message
    
    # Simple processing - no complex debugging
    logger.info(f"🎯 MODELING: Processing '{user_message[:50]}...'")
    
    try:
        # Check if this is a request to add a single class/element
        single_element_keywords = ['add', 'create', 'make']
        class_keywords = ['class', 'interface', 'entity']
        
        is_single_element = any(keyword in user_message.lower() for keyword in single_element_keywords)
        is_class_request = any(keyword in user_message.lower() for keyword in class_keywords)
        
        if is_single_element and is_class_request:
            # Generate a single class element using simplified approach
            element_result = generate_simple_class_spec(user_message)
            
            if element_result and element_result.get('element'):
                element = element_result['element']
                class_name = element.get('className', 'NewClass')
                attributes_count = len(element.get('attributes', []))
                methods_count = len(element.get('methods', []))
                
                # Create a special response format for automatic injection
                response_data = {
                    "action": "inject_element",
                    "element": element,
                    "message": f"✨ **Added {class_name} class to your diagram!**\n\nThe class has been automatically injected into your editor with:\n• {attributes_count} attribute(s)\n• {methods_count} method(s)\n\n🎯 You can continue adding more classes or ask me to create relationships!"
                }
                
                # Send the special injection response
                session.reply(json.dumps(response_data))
            else:
                session.reply("I had trouble creating that class. Could you provide more details about what you'd like to add?")
        
        # Check for system/complete model requests
        elif any(keyword in user_message.lower() for keyword in ['system', 'model', 'platform', 'application', 'complete', 'several classes', 'multiple classes']):
            # For complete systems, generate simplified spec and let frontend handle Apollon conversion
            system_result = generate_complete_system_with_ai(user_message)
            
            if system_result and system_result.get('systemSpec'):
                # Send the simplified system specification response
                session.reply(json.dumps(system_result))
            else:
                session.reply("I had trouble generating that system. Could you provide more details about what you'd like to create?")
        
        else:
            # General modeling help using OpenAI
            help_prompt = f"""You are a UML modeling expert assistant. The user asked: "{user_message}"

Provide helpful, practical advice about UML modeling. If they're asking about concepts, explain them clearly. If they want to create something, guide them on how to express their requirements for model generation.

Keep your response conversational and encouraging. Suggest specific things they can ask you to create."""
            
            answer = gpt.predict(help_prompt)
            session.reply(answer)
            
    except Exception as e:
        logger.error(f"Error in modeling_body: {e}")
        session.reply("I encountered an issue while helping you. Could you please try rephrasing your request?")

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
