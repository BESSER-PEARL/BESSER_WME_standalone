"""
Agent Diagram Handler
Handles generation of UML Agent Diagrams (Multi-Agent Systems)
"""

from typing import Dict, Any
from .base_handler import BaseDiagramHandler


class AgentDiagramHandler(BaseDiagramHandler):
    """Handler for Agent Diagram generation"""
    
    def get_diagram_type(self) -> str:
        return "AgentDiagram"
    
    def get_system_prompt(self) -> str:
        return """You are a UML modeling expert specializing in multi-agent systems. Create an agent specification based on the user's request.

Return ONLY a JSON object with this structure:
{
  "agentName": "AgentName",
  "agentType": "autonomous",
  "capabilities": ["capability1", "capability2"],
  "beliefs": ["belief1", "belief2"],
  "goals": ["goal1", "goal2"]
}

Agent Types: "autonomous", "reactive", "deliberative", "hybrid"

IMPORTANT RULES:
1. Agent names should be descriptive (UserAgent, MonitorAgent, PlannerAgent)
2. Include 2-4 capabilities (what the agent can do)
3. Include 1-3 beliefs (what the agent knows/assumes)
4. Include 1-3 goals (what the agent wants to achieve)
5. Keep it SIMPLE and focused
6. Return ONLY the JSON, no explanations

Examples:
- "create monitoring agent" -> {"agentName": "MonitorAgent", "agentType": "reactive", "capabilities": ["observe", "report"], "beliefs": ["system is observable"], "goals": ["detect anomalies"]}
- "create planning agent" -> {"agentName": "PlannerAgent", "agentType": "deliberative", "capabilities": ["analyze", "plan", "optimize"], "beliefs": ["resources are limited"], "goals": ["find optimal solution"]}

Return ONLY the JSON, no explanations."""
    
    def generate_single_element(self, user_request: str) -> Dict[str, Any]:
        """Generate a single agent"""
        
        system_prompt = self.get_system_prompt()
        user_prompt = f"Create an agent specification for: {user_request}"
        
        try:
            response = self.llm.predict(f"{system_prompt}\n\nUser Request: {user_prompt}")
            
            if not response:
                raise Exception("GPT returned empty response")
            
            json_text = self.clean_json_response(response)
            agent_spec = self.parse_json_safely(json_text)
            
            if not agent_spec:
                raise Exception("Failed to parse JSON response")
            
            return {
                "action": "inject_element",
                "element": agent_spec,
                "diagramType": "AgentDiagram",
                "message": f"✅ Successfully created agent '{agent_spec['agentName']}' with {len(agent_spec.get('capabilities', []))} capabilities!"
            }
            
        except Exception as e:
            return self.generate_fallback_element(user_request)
    
    def generate_complete_system(self, user_request: str) -> Dict[str, Any]:
        """Generate a complete multi-agent system"""
        
        system_prompt = """You are a UML modeling expert specializing in multi-agent systems. Create a COMPLETE multi-agent system diagram.

Return ONLY a JSON object with this structure:
{
  "systemName": "SystemName",
  "agents": [
    {
      "agentName": "AgentName",
      "agentType": "autonomous",
      "capabilities": ["capability1"],
      "beliefs": ["belief1"],
      "goals": ["goal1"]
    }
  ],
  "messages": [
    {
      "sender": "Agent1",
      "receiver": "Agent2",
      "messageType": "request",
      "content": "message description"
    }
  ],
  "environment": {
    "name": "EnvironmentName",
    "properties": ["property1", "property2"]
  }
}

Agent Types: "autonomous", "reactive", "deliberative", "hybrid"
Message Types: "request", "inform", "propose", "accept", "reject"

IMPORTANT RULES:
1. Create 3-5 agents with different roles
2. Include meaningful interactions (messages) between agents
3. Define the environment they operate in
4. Each agent should have distinct capabilities and goals
5. Messages should represent realistic agent communication
6. Keep the system coherent and focused

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
                "diagramType": "AgentDiagram",
                "message": f"✨ **Created {system_spec.get('systemName', 'multi-agent')} system!**\n\n🏗️ Generated:\n• {len(system_spec.get('agents', []))} agents\n• {len(system_spec.get('messages', []))} message(s)\n• Environment: {system_spec.get('environment', {}).get('name', 'N/A')}\n\n🎯 The complete agent system has been automatically injected into your editor!"
            }
            
        except Exception as e:
            return self.generate_fallback_system()
    
    def generate_fallback_element(self, request: str) -> Dict[str, Any]:
        """Generate a fallback agent when AI generation fails"""
        agent_name = self.extract_name_from_request(request, "NewAgent")
        if not agent_name.endswith("Agent"):
            agent_name += "Agent"
        
        fallback_spec = {
            "agentName": agent_name,
            "agentType": "autonomous",
            "capabilities": ["act"],
            "beliefs": ["environment exists"],
            "goals": ["achieve objective"]
        }
        
        return {
            "action": "inject_element",
            "element": fallback_spec,
            "diagramType": "AgentDiagram",
            "message": f"⚠️ Created basic agent '{agent_name}' (AI generation failed)"
        }
    
    def generate_fallback_system(self) -> Dict[str, Any]:
        """Generate a fallback multi-agent system"""
        return {
            "action": "inject_complete_system",
            "systemSpec": {
                "systemName": "BasicAgentSystem",
                "agents": [
                    {
                        "agentName": "Agent1",
                        "agentType": "autonomous",
                        "capabilities": ["observe", "act"],
                        "beliefs": ["environment is observable"],
                        "goals": ["achieve goal"]
                    },
                    {
                        "agentName": "Agent2",
                        "agentType": "reactive",
                        "capabilities": ["respond"],
                        "beliefs": ["messages arrive"],
                        "goals": ["process requests"]
                    }
                ],
                "messages": [
                    {
                        "sender": "Agent1",
                        "receiver": "Agent2",
                        "messageType": "request",
                        "content": "perform action"
                    }
                ],
                "environment": {
                    "name": "BasicEnvironment",
                    "properties": ["observable", "dynamic"]
                }
            },
            "diagramType": "AgentDiagram",
            "message": "⚠️ Created basic agent system (AI generation failed)"
        }
