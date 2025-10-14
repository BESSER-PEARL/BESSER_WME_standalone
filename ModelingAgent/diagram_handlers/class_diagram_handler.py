"""
Class Diagram Handler
Handles generation of UML Class Diagrams
"""

from typing import Dict, Any

from .base_handler import BaseDiagramHandler


class ClassDiagramHandler(BaseDiagramHandler):
    """Handler for Class Diagram generation"""

    def get_diagram_type(self) -> str:
        return "ClassDiagram"

    def get_system_prompt(self) -> str:
        return """You are a UML modeling expert. Create a MINIMAL, focused class specification based on the user's request.

Return ONLY a JSON object with this structure:
{
  "className": "ExactClassName",
  "attributes": [
    {"name": "attributeName", "type": "String", "visibility": "public"},
    {"name": "anotherAttr", "type": "int", "visibility": "private"}
  ],
  "methods": [
    {"name": "methodName", "returnType": "void", "visibility": "public", "parameters": []}
  ]
}

IMPORTANT RULES:
1. Generate 2-4 ESSENTIAL attributes only
2. Generate 0-2 methods ONLY if they make sense for the class
3. If the user just says "create X class", generate minimal attributes and NO methods
4. Use proper programming conventions
5. Keep it SIMPLE and focused
6. Return ONLY the JSON, no explanations

Examples:
- "create User class" -> 2-3 attributes (id, name, email), 0-1 method
- "create Product class" -> 2-3 attributes (id, name, price), 0 methods
- "create Order with payment" -> 3-4 attributes including paymentMethod, 1 method (processOrder)

Return ONLY the JSON, no explanations."""

    def generate_single_element(self, user_request: str) -> Dict[str, Any]:
        """Generate a single class element"""

        system_prompt = self.get_system_prompt()
        user_prompt = f"Create a class specification for: {user_request}"

        try:
            response = self.llm.predict(f"{system_prompt}\n\nUser Request: {user_prompt}")

            if not response:
                raise ValueError("GPT returned empty response")

            json_text = self.clean_json_response(response)
            simple_spec = self.parse_json_safely(json_text)

            if not simple_spec:
                raise ValueError("Failed to parse JSON response")

            message = (
                f"Created class '{simple_spec['className']}' with "
                f"{len(simple_spec.get('attributes', []))} attribute(s) and "
                f"{len(simple_spec.get('methods', []))} method(s)."
            )

            return {
                "action": "inject_element",
                "element": simple_spec,
                "diagramType": self.get_diagram_type(),
                "message": message
            }

        except Exception:
            return self.generate_fallback_element(user_request)

    def generate_complete_system(self, user_request: str) -> Dict[str, Any]:
        """Generate a complete class diagram with multiple classes"""

        system_prompt = """You are a UML modeling expert. Create a COMPLETE, well-structured class diagram system.

Return ONLY a JSON object with this structure:
{
  "systemName": "SystemName",
  "classes": [
    {
      "className": "ClassName",
      "attributes": [
        {"name": "attr", "type": "String", "visibility": "public"}
      ],
      "methods": [
        {"name": "method", "returnType": "void", "visibility": "private", "parameters": []}
      ]
    }
  ],
  "relationships": [
    {
      "type": "association",
      "source": "ClassName1",
      "target": "ClassName2",
      "sourceMultiplicity": "1",
      "targetMultiplicity": "*"
    }
  ]
}

IMPORTANT RULES:
1. Create 3-6 related classes
2. Each class should have 2-4 essential attributes
3. Minimize methods (0-2 per class)
4. Include meaningful relationships (association, inheritance, composition)
5. Use proper UML relationship types
6. Keep it focused and coherent

Return ONLY the JSON, no explanations."""

        try:
            response = self.llm.predict(f"{system_prompt}\n\nUser Request: {user_request}")

            if not response:
                raise ValueError("GPT returned empty response")

            json_text = self.clean_json_response(response)
            system_spec = self.parse_json_safely(json_text)

            if not system_spec:
                raise ValueError("Failed to parse JSON response")

            message = (
                f"Created {system_spec.get('systemName', 'your')} system with "
                f"{len(system_spec.get('classes', []))} class(es) and "
                f"{len(system_spec.get('relationships', []))} relationship(s)."
            )

            return {
                "action": "inject_complete_system",
                "systemSpec": system_spec,
                "diagramType": self.get_diagram_type(),
                "message": message
            }

        except Exception:
            return self.generate_fallback_system()

    def generate_fallback_element(self, request: str) -> Dict[str, Any]:
        """Generate a fallback class when AI generation fails"""
        class_name = self.extract_name_from_request(request, "NewClass")

        fallback_spec = {
            "className": class_name,
            "attributes": [
                {"name": "id", "type": "String", "visibility": "public"},
                {"name": "name", "type": "String", "visibility": "private"}
            ],
            "methods": []
        }

        return {
            "action": "inject_element",
            "element": fallback_spec,
            "diagramType": self.get_diagram_type(),
            "message": f"Created basic {class_name} class (fallback)."
        }

    def generate_fallback_system(self) -> Dict[str, Any]:
        """Generate a fallback system"""
        return {
            "action": "inject_complete_system",
            "systemSpec": {
                "systemName": "BasicSystem",
                "classes": [
                    {
                        "className": "Entity",
                        "attributes": [
                            {"name": "id", "type": "String", "visibility": "public"}
                        ],
                        "methods": []
                    }
                ],
                "relationships": []
            },
            "diagramType": self.get_diagram_type(),
            "message": "Created basic class system (fallback)."
        }
    
    # ------------------------------------------------------------------
    # Modification Support (Existing - Updated for new architecture)
    # ------------------------------------------------------------------
    
    def generate_modification(self, user_request: str, current_model: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate modifications for existing class diagram elements"""
        
        system_prompt = """You are a UML modeling expert. The user wants to modify an existing class diagram.

Return ONLY a JSON object with this structure:

MODIFY CLASS
{
  "action": "modify_model",
  "modification": {
    "action": "modify_class",
    "target": {
      "className": "CurrentClassName"
    },
    "changes": {
      "name": "NewClassName"
    }
  }
}

MODIFY ATTRIBUTE
{
  "action": "modify_model",
  "modification": {
    "action": "modify_attribute",
    "target": {
      "className": "ClassName",
      "attributeName": "oldAttributeName"
    },
    "changes": {
      "name": "newAttributeName",
      "type": "String",
      "visibility": "public"
    }
  }
}

MODIFY METHOD
{
  "action": "modify_model",
  "modification": {
    "action": "modify_method",
    "target": {
      "className": "ClassName",
      "methodName": "oldMethodName"
    },
    "changes": {
      "name": "newMethodName",
      "returnType": "void",
      "visibility": "public",
      "parameters": [{"name": "param", "type": "String"}]
    }
  }
}

ADD RELATIONSHIP
{
  "action": "modify_model",
  "modification": {
    "action": "add_relationship",
    "target": {
      "sourceClass": "SourceClass",
      "targetClass": "TargetClass"
    },
    "changes": {
      "type": "Association",
      "sourceMultiplicity": "1",
      "targetMultiplicity": "*",
      "name": "relationshipName"
    }
  }
}

REMOVE ELEMENT
{
  "action": "modify_model",
  "modification": {
    "action": "remove_element",
    "target": {
      "className": "ClassToRemove"
    }
  }
}

IMPORTANT RULES:
1. Use "modify_class", "modify_attribute", or "modify_method" to rename/change properties
2. Use "add_relationship" to connect classes (Association, Inheritance, Composition, Aggregation)
3. Use "remove_element" to delete classes, attributes, methods, or relationships
4. visibility can be "public", "private", or "protected"
5. Relationship types: Association, Inheritance, Composition, Aggregation
6. Only reference elements that exist in the current model
7. Return ONLY the JSON object – no explanations"""

        # Build context from current model
        context_info = []
        if current_model and isinstance(current_model, dict):
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
            context_block = "\n\nCurrent class diagram:\n- " + "\n- ".join(context_info[:8])
        
        user_prompt = f"Modify the class diagram: {user_request}{context_block}"
        
        try:
            response = self.llm.predict(f"{system_prompt}\n\nUser Request: {user_prompt}")
            
            if not response:
                raise ValueError("GPT returned empty response")
            
            json_text = self.clean_json_response(response)
            modification_spec = self.parse_json_safely(json_text)
            
            if not modification_spec or not modification_spec.get('modification'):
                raise ValueError("Failed to parse modification JSON")
            
            # Ensure proper structure
            modification_spec.setdefault('action', 'modify_model')
            modification_spec.setdefault('diagramType', self.get_diagram_type())
            
            # Generate message if not provided
            if 'message' not in modification_spec:
                mod_action = modification_spec['modification'].get('action', 'modification')
                target = modification_spec['modification'].get('target', {})
                target_name = target.get('className') or target.get('attributeName') or target.get('methodName') or 'element'
                modification_spec['message'] = f"Applied {mod_action} to {target_name}"
            
            return modification_spec
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error generating class diagram modification: {e}")
            return self.generate_fallback_modification(user_request)
    
    def generate_fallback_modification(self, request: str) -> Dict[str, Any]:
        """Generate a fallback modification when AI generation fails"""
        return {
            "action": "modify_model",
            "modification": {
                "action": "modify_class",
                "target": {"className": "Unknown"},
                "changes": {"name": "ModifiedClass"}
            },
            "diagramType": self.get_diagram_type(),
            "message": "Failed to generate modification automatically (fallback used)."
        }
