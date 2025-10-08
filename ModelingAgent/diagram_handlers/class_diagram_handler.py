"""
Class Diagram Handler
Handles generation of UML Class Diagrams
"""

import json
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
    {"name": "attributeName", "type": "String", "visibility": "private"},
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
                raise Exception("GPT returned empty response")
            
            json_text = self.clean_json_response(response)
            simple_spec = self.parse_json_safely(json_text)
            
            if not simple_spec:
                raise Exception("Failed to parse JSON response")
            
            return {
                "action": "inject_element",
                "element": simple_spec,
                "message": f"✅ Successfully created {simple_spec['className']} class with {len(simple_spec.get('attributes', []))} attributes and {len(simple_spec.get('methods', []))} methods!"
            }
            
        except Exception as e:
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
        {"name": "attr", "type": "String", "visibility": "private"}
      ],
      "methods": [
        {"name": "method", "returnType": "void", "visibility": "public", "parameters": []}
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
            
            json_text = self.clean_json_response(response)
            system_spec = self.parse_json_safely(json_text)
            
            if not system_spec:
                raise Exception("Failed to parse JSON response")
            
            return {
                "action": "inject_complete_system",
                "systemSpec": system_spec,
                "message": f"✨ **Created {system_spec.get('systemName', 'your')} system!**\n\n🏗️ Generated:\n• {len(system_spec.get('classes', []))} classes\n• {len(system_spec.get('relationships', []))} relationship(s)\n\n🎯 The complete system has been automatically injected into your editor!"
            }
            
        except Exception as e:
            return self.generate_fallback_system()
    
    def generate_fallback_element(self, request: str) -> Dict[str, Any]:
        """Generate a fallback class when AI generation fails"""
        class_name = self.extract_name_from_request(request, "NewClass")
        
        fallback_spec = {
            "className": class_name,
            "attributes": [
                {"name": "id", "type": "String", "visibility": "private"},
                {"name": "name", "type": "String", "visibility": "private"}
            ],
            "methods": []
        }
        
        return {
            "action": "inject_element",
            "element": fallback_spec,
            "message": f"⚠️ Created basic {class_name} class (AI generation failed)"
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
                            {"name": "id", "type": "String", "visibility": "private"}
                        ],
                        "methods": []
                    }
                ],
                "relationships": []
            },
            "message": "⚠️ Created basic system (AI generation failed)"
        }
