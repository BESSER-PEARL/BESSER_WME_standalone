"""
Agent Diagram Handler
Handles generation of UML Agent Diagrams (multi-agent conversational flows)
"""

from typing import Dict, Any, List, Optional
import logging

from .base_handler import BaseDiagramHandler

# Get logger
logger = logging.getLogger(__name__)


class AgentDiagramHandler(BaseDiagramHandler):
    """Handler for Agent Diagram generation"""

    def get_diagram_type(self) -> str:
        return "AgentDiagram"

    def get_system_prompt(self) -> str:
        return """You are a conversational agent modeling expert. Create a SINGLE agent diagram element specification.

Return ONLY a JSON object that follows ONE of these schemas:

STATE NODE
{
  "type": "state",
  "stateName": "state_name",
  "replies": [
    {"text": "reply text", "replyType": "text"},
    {"text": "fallback handled by LLM", "replyType": "llm"}
  ],
  "fallbackBodies": [
    {"text": "fallback reply", "replyType": "text"}
  ]
}

INTENT NODE
{
  "type": "intent",
  "intentName": "IntentName",
  "trainingPhrases": ["example phrase 1", "example phrase 2", "example phrase 3"]
}

INITIAL NODE
{
  "type": "initial",
  "description": "optional note"
}

IMPORTANT RULES:
1. Provide the "type" field (state, intent, or initial) based on the user request.
2. For states include 1-3 "replies" with both "text" and "replyType" (text, llm, or code).
3. Add "fallbackBodies" only when the request mentions fallbacks or error handling.
4. For intents include 3-4 "trainingPhrases" that reflect how a user would trigger the intent.
5. Keep names concise (camelCase for states, TitleCase for intents).
6. Return ONLY the JSON object – no explanations."""

    def generate_single_element(self, user_request: str) -> Dict[str, Any]:
        """Generate a single agent diagram element"""

        system_prompt = self.get_system_prompt()
        user_prompt = f"Create an agent diagram element specification for: {user_request}"

        try:
            response = self.llm.predict(f"{system_prompt}\n\nUser Request: {user_prompt}")

            if not response:
                raise ValueError("GPT returned empty response")

            json_text = self.clean_json_response(response)
            agent_spec = self.parse_json_safely(json_text)

            if not agent_spec:
                raise ValueError("Failed to parse JSON response")

            normalized_spec = self._normalize_single_element_spec(agent_spec, user_request)
            message = self._build_single_element_message(normalized_spec)

            return {
                "action": "inject_element",
                "element": normalized_spec,
                "diagramType": self.get_diagram_type(),
                "message": message
            }

        except Exception:
            return self.generate_fallback_element(user_request)

    def generate_complete_system(self, user_request: str) -> Dict[str, Any]:
        """Generate a complete agent conversation flow"""

        system_prompt = """You are a conversational agent modeling expert. Create a COMPLETE agent diagram specification.

Return ONLY a JSON object with this structure:
{
  "systemName": "FriendlyAgent",
  "hasInitialNode": true,
  "intents": [
    {
      "intentName": "Greeting",
      "trainingPhrases": ["hi", "hello there", "hey assistant"]
    }
  ],
  "states": [
    {
      "type": "state",
      "stateName": "greeting",
      "replies": [
        {"text": "Hi!", "replyType": "text"},
        {"text": "How are you?", "replyType": "text"}
      ],
      "fallbackBodies": [
        {"text": "I can say hello in another way if needed.", "replyType": "text"}
      ]
    },
    {
      "type": "state",
      "stateName": "supportResponse",
      "replies": [
        {"text": "Sure, let me help you with that.", "replyType": "text"},
        {"text": "Could you share a bit more detail?", "replyType": "text"}
      ],
      "fallbackBodies": [
        {"text": "If this is urgent, I can connect you to a human agent.", "replyType": "text"}
      ]
    }
  ],
  "transitions": [
    {
      "source": "initial",
      "target": "greeting",
      "condition": "when_intent_matched",
      "conditionValue": "Greeting",
      "label": ""
    },
    {
      "source": "greeting",
      "target": "supportResponse",
      "condition": "when_intent_matched",
      "conditionValue": "Support"
    },
    {
      "source": "supportResponse",
      "target": "initial",
      "condition": "auto",
      "conditionValue": ""
    }
  ]
}

IMPORTANT RULES:
1. Include 3-5 states – each with meaningful replies and optional fallback bodies.
2. Define 2-4 intents with realistic training phrases (use natural user expressions).
3. Always include an initial transition from "initial" to the first conversational state when hasInitialNode is true.
4. Use "when_intent_matched" with "conditionValue" equal to an intent name for intent-based transitions.
5. Use "auto" transitions for default flows or state resets.
6. Keep names consistent and concise (state names camelCase, intent names TitleCase).
7. Return ONLY the JSON object – no explanations."""

        try:
            response = self.llm.predict(f"{system_prompt}\n\nUser Request: {user_request}")

            if not response:
                raise ValueError("GPT returned empty response")

            json_text = self.clean_json_response(response)
            system_spec = self.parse_json_safely(json_text)

            if not system_spec:
                raise ValueError("Failed to parse JSON response")

            normalized_system = self._normalize_system_spec(system_spec, user_request)
            message = (
                f"Created agent system '{normalized_system.get('systemName')}' with "
                f"{len(normalized_system.get('states', []))} states and "
                f"{len(normalized_system.get('intents', []))} intents."
            )

            return {
                "action": "inject_complete_system",
                "systemSpec": normalized_system,
                "diagramType": self.get_diagram_type(),
                "message": message
            }

        except Exception:
            return self.generate_fallback_system(user_request)

    def generate_fallback_element(self, request: str) -> Dict[str, Any]:
        """Generate a fallback agent element when AI generation fails"""
        state_name = self.extract_name_from_request(request, "support")
        fallback_spec = {
            "type": "state",
            "stateName": state_name.lower(),
            "replies": [
                {"text": f"How can I assist with {state_name}?", "replyType": "text"},
                {"text": "I'm here to help you move forward.", "replyType": "text"}
            ],
            "fallbackBodies": [
                {"text": "Let me know how else I can help.", "replyType": "text"}
            ]
        }

        return {
            "action": "inject_element",
            "element": fallback_spec,
            "diagramType": self.get_diagram_type(),
            "message": f"Created basic agent state '{fallback_spec['stateName']}' (default fallback)."
        }

    def generate_fallback_system(self, request: str = "Agent") -> Dict[str, Any]:
        """Generate a fallback agent system"""
        base_name = self.extract_name_from_request(request, "Assistant")
        system_spec = {
            "systemName": f"{base_name}AgentSystem",
            "hasInitialNode": True,
            "intents": [
                {
                    "type": "intent",
                    "intentName": "Greeting",
                    "trainingPhrases": ["hi", "hello", "hey"]
                },
                {
                    "type": "intent",
                    "intentName": "Support",
                    "trainingPhrases": ["I need help", "support please", "can you assist"]
                }
            ],
            "states": [
                {
                    "type": "state",
                    "stateName": "initialGreeting",
                    "replies": [
                        {"text": "Hi there!", "replyType": "text"},
                        {"text": "How are you doing today?", "replyType": "text"}
                    ],
                    "fallbackBodies": [
                        {"text": "If you need help just ask.", "replyType": "text"}
                    ]
                },
                {
                    "type": "state",
                    "stateName": "supportResponse",
                    "replies": [
                        {"text": "I'm sorry you're facing trouble.", "replyType": "text"},
                        {"text": "Let me gather some details to help.", "replyType": "text"}
                    ],
                    "fallbackBodies": [
                        {"text": "You can rephrase what you need help with.", "replyType": "text"}
                    ]
                }
            ],
            "transitions": [
                {
                    "source": "initial",
                    "target": "initialGreeting",
                    "condition": "when_intent_matched",
                    "conditionValue": "Greeting",
                    "label": ""
                },
                {
                    "source": "initialGreeting",
                    "target": "supportResponse",
                    "condition": "when_intent_matched",
                    "conditionValue": "Support",
                    "label": ""
                },
                {
                    "source": "supportResponse",
                    "target": "initialGreeting",
                    "condition": "auto",
                    "conditionValue": "",
                    "label": ""
                }
            ]
        }

        return {
            "action": "inject_complete_system",
            "systemSpec": system_spec,
            "diagramType": self.get_diagram_type(),
            "message": "Created basic agent system (default fallback)."
        }

    # ------------------------------------------------------------------
    # Normalization helpers
    # ------------------------------------------------------------------

    def _normalize_single_element_spec(self, spec: Dict[str, Any], request: str) -> Dict[str, Any]:
        """Ensure single element spec matches converter expectations"""
        element_type = str(spec.get("type") or spec.get("elementType") or "").lower()

        if element_type == "intent":
            normalized_intent = self._normalize_intent_spec(spec, request)
            if not normalized_intent:
                raise ValueError("Intent specification requires at least one training phrase.")
            return normalized_intent

        if element_type in {"initial", "initialnode", "start"}:
            return {"type": "initial"}

        # Default to state specification
        return self._normalize_state_spec(spec, request)

    def _normalize_state_spec(self, spec: Dict[str, Any], request: str) -> Dict[str, Any]:
        """Normalize a state specification"""
        state_name = spec.get("stateName") or spec.get("name")
        if not state_name:
            state_name = self.extract_name_from_request(request, "newState").lower()

        replies = self._normalize_reply_list(
            spec.get("replies") or spec.get("bodies") or spec.get("responses"),
            default_text=f"Response from {state_name} state"
        )
        fallback_bodies = self._normalize_reply_list(
            spec.get("fallbackBodies") or spec.get("fallbacks") or spec.get("fallbackReplies"),
            default_text=""
        )

        return {
            "type": "state",
            "stateName": state_name,
            "replies": replies,
            "fallbackBodies": fallback_bodies
        }

    def _normalize_intent_spec(self, spec: Dict[str, Any], request: str) -> Dict[str, Any]:
        """Normalize an intent specification. Returns None if no usable phrases."""
        intent_name = spec.get("intentName") or spec.get("name")
        if not intent_name:
            intent_name = self.extract_name_from_request(request, "Intent")

        raw_phrases = spec.get("trainingPhrases") or spec.get("intentBodies") or spec.get("examples") or []
        phrases: List[str] = []
        for entry in raw_phrases:
            if isinstance(entry, str):
                phrase = entry.strip()
                if phrase:
                    phrases.append(phrase)
            elif isinstance(entry, dict):
                text = (entry.get("text") or entry.get("phrase") or "").strip()
                if text:
                    phrases.append(text)

        if not phrases:
            return None

        return {
            "type": "intent",
            "intentName": intent_name,
            "trainingPhrases": phrases[:5]
        }

    def _normalize_reply_list(self, replies: Any, default_text: str) -> List[Dict[str, str]]:
        """Normalize reply/fallback entries into structured dictionaries"""
        normalized: List[Dict[str, str]] = []
        if isinstance(replies, list):
            for entry in replies:
                if isinstance(entry, str):
                    text = entry.strip()
                    if text:
                        normalized.append({"text": text, "replyType": "text"})
                elif isinstance(entry, dict):
                    text = (
                        entry.get("text")
                        or entry.get("message")
                        or entry.get("name")
                        or ""
                    ).strip()
                    if not text:
                        continue
                    reply_type = entry.get("replyType") or entry.get("type") or "text"
                    normalized.append({"text": text, "replyType": reply_type})

        if not normalized and default_text:
            normalized.append({"text": default_text, "replyType": "text"})

        return normalized

    def _normalize_system_spec(self, spec: Dict[str, Any], request: str) -> Dict[str, Any]:
        """Normalize a complete agent system specification"""
        system_name = spec.get("systemName") or self.extract_name_from_request(request, "AgentSystem")

        intents = [
            normalized
            for intent_spec in spec.get("intents", [])
            for normalized in [self._normalize_intent_spec(intent_spec, request)]
            if normalized
        ]

        states = [
            self._normalize_state_spec(state_spec, request)
            for state_spec in spec.get("states", [])
        ]

        transitions: List[Dict[str, Any]] = []
        for transition in spec.get("transitions", []):
            if not transition:
                continue
            normalized = self._normalize_transition_spec(transition, states)
            if normalized:
                transitions.append(normalized)

        has_initial = bool(spec.get("hasInitialNode", True))
        if has_initial and states:
            has_initial_transition = any(t.get("source") == "initial" for t in transitions)
            if not has_initial_transition:
                transitions.insert(0, {
                    "source": "initial",
                    "target": states[0]["stateName"],
                    "condition": "auto",
                    "conditionValue": "",
                    "label": ""
                })

        return {
            "systemName": system_name,
            "hasInitialNode": has_initial,
            "intents": intents,
            "states": states,
            "transitions": transitions
        }

    def _normalize_transition_spec(self, transition: Dict[str, Any], states: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Normalize transition specification"""
        if not states:
            return None

        state_names = {state["stateName"] for state in states}
        primary_state = next(iter(state_names), None)

        source = transition.get("source") or transition.get("from") or "initial"
        target = transition.get("target") or transition.get("to")
        if not target:
            target = primary_state or "initial"

        if source not in state_names and source != "initial":
            source = primary_state or "initial"

        if target not in state_names and target != "initial":
            target = primary_state

        if target is None or (target not in state_names and target != "initial"):
            return None

        condition = transition.get("condition") or transition.get("trigger") or "auto"
        condition_value = (
            transition.get("conditionValue")
            or transition.get("intent")
            or transition.get("triggerValue")
            or ""
        )
        label = transition.get("label") or transition.get("name") or ""

        normalized = {
            "source": source,
            "target": target,
            "condition": condition,
            "conditionValue": condition_value,
            "label": label
        }

        if transition.get("sourceDirection"):
            normalized["sourceDirection"] = transition["sourceDirection"]
        if transition.get("targetDirection"):
            normalized["targetDirection"] = transition["targetDirection"]

        return normalized

    def _build_single_element_message(self, spec: Dict[str, Any]) -> str:
        """Generate a friendly status message for a single element"""
        element_type = spec.get("type")

        if element_type == "intent":
            phrases = spec.get("trainingPhrases", [])
            return (
                f"Created agent intent '{spec.get('intentName')}' "
                f"with {len(phrases)} training phrase(s)."
            )

        if element_type == "initial":
            return "Created agent initial node."

        replies = spec.get("replies", [])
        return (
            f"Created agent state '{spec.get('stateName')}' "
            f"with {len(replies)} reply option(s)."
        )

    # ------------------------------------------------------------------
    # Modification Support (NEW)
    # ------------------------------------------------------------------

    def generate_modification(self, user_request: str, current_model: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate modifications for existing agent diagram elements"""
        
        system_prompt = """You are a conversational agent modeling expert. The user wants to modify an existing agent diagram.

Return ONLY a JSON object with this structure:

MODIFY STATE
{
  "action": "modify_model",
  "modification": {
    "action": "modify_state",
    "target": {
      "stateName": "currentStateName"
    },
    "changes": {
      "name": "newStateName"
    }
  }
}

MODIFY INTENT
{
  "action": "modify_model",
  "modification": {
    "action": "modify_intent",
    "target": {
      "intentName": "CurrentIntentName"
    },
    "changes": {
      "name": "NewIntentName"
    }
  }
}

ADD TRANSITION
{
  "action": "modify_model",
  "modification": {
    "action": "add_transition",
    "target": {
      "sourceStateName": "sourceState",
      "targetStateName": "targetState"
    },
    "changes": {
      "intentName": "TriggerIntent",
      "condition": "when_intent_matched"
    }
  }
}

REMOVE TRANSITION
{
  "action": "modify_model",
  "modification": {
    "action": "remove_transition",
    "target": {
      "transitionId": "optional_id",
      "sourceStateName": "sourceState",
      "targetStateName": "targetState"
    }
  }
}

ADD STATE BODY (REPLY)
{
  "action": "modify_model",
  "modification": {
    "action": "add_state_body",
    "target": {
      "stateName": "existingState"
    },
    "changes": {
      "text": "Reply text to add",
      "replyType": "text"
    }
  }
}

ADD INTENT TRAINING PHRASE
{
  "action": "modify_model",
  "modification": {
    "action": "add_intent_training_phrase",
    "target": {
      "intentName": "ExistingIntent"
    },
    "changes": {
      "trainingPhrase": "new example phrase"
    }
  }
}

REMOVE ELEMENT
{
  "action": "modify_model",
  "modification": {
    "action": "remove_element",
    "target": {
      "stateName": "stateToRemove"
    }
  }
}

IMPORTANT RULES:
1. Use "modify_state" or "modify_intent" to rename elements
2. Use "add_transition" to connect states (source -> target)
3. Use "remove_transition" to disconnect states
4. Use "add_state_body" to add reply text to states
5. Use "add_intent_training_phrase" to add examples to intents
6. Use "remove_element" to delete states or intents
7. For transitions, "condition" is usually "when_intent_matched" with an "intentName"
8. Only reference elements that exist in the current model
9. Return ONLY the JSON object – no explanations"""

        # Build context from current model
        context_info = []
        if current_model and isinstance(current_model, dict):
            elements = current_model.get('elements', {})
            relationships = current_model.get('relationships', {})
            
            # List states
            states = [e.get('name') for e in elements.values() if e.get('type') == 'AgentState']
            if states:
                context_info.append(f"States: {', '.join(states[:10])}")
            
            # List intents
            intents = [e.get('name') for e in elements.values() if e.get('type') == 'AgentIntent']
            if intents:
                context_info.append(f"Intents: {', '.join(intents[:10])}")
            
            # List transitions
            transitions = []
            for rel in relationships.values():
                if rel.get('type') == 'AgentTransition':
                    source = elements.get(rel.get('source', {}))
                    target = elements.get(rel.get('target', {}))
                    if source and target:
                        transitions.append(f"{source.get('name')} → {target.get('name')}")
            if transitions:
                context_info.append(f"Transitions: {', '.join(transitions[:5])}")
        
        context_block = ''
        if context_info:
            context_block = "\n\nCurrent agent diagram:\n- " + "\n- ".join(context_info)
        
        user_prompt = f"Modify the agent diagram: {user_request}{context_block}"
        
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
                target_name = target.get('stateName') or target.get('intentName') or 'element'
                modification_spec['message'] = f"Applied {mod_action} to {target_name}"
            
            return modification_spec
            
        except Exception as e:
            logger.error(f"Error generating agent diagram modification: {e}")
            return self.generate_fallback_modification(user_request)
    
    def generate_fallback_modification(self, request: str) -> Dict[str, Any]:
        """Generate a fallback modification when AI generation fails"""
        return {
            "action": "modify_model",
            "modification": {
                "action": "modify_state",
                "target": {"stateName": "unknown"},
                "changes": {"name": "modifiedState"}
            },
            "diagramType": self.get_diagram_type(),
            "message": "Failed to generate modification automatically (fallback used)."
        }
