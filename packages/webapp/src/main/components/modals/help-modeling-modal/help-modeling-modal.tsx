import React, { useState } from 'react';
import { Button, Modal, Nav } from 'react-bootstrap';
import { ModalContentProps } from '../application-modal-types';

export const HelpModelingModal: React.FC<ModalContentProps> = ({ close }) => {
  const [activePanel, setActivePanel] = useState('class');

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>How to use this editor?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link
              active={activePanel === 'class'}
              onClick={() => setActivePanel('class')}
            >
              Class Diagram
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activePanel === 'agent'}
              onClick={() => setActivePanel('agent')}
            >
              Agent Diagram
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {activePanel === 'class' ? (
          <table className="table">
            <tbody>
              <tr>
                <th>Add Class</th>
                <td>
                  To add a class, simply drag and drop one of the elements on the left side into the editor area on the
                  right side.
                </td>
                <td>
                  <img width="300" src="/images/help/help-create-element.png" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Add Association or Generalization</th>
                <td>
                  To add an association, select the source class with a single click and you will see blue circles.
                  Those are the possible connection points for associations. Click and hold on one of those and drag it to
                  another blue circle to create an association. Define multiplicity using the following format:
                  1, 0..1, 0..*, 1..*, 2..4, etc. (Default is 1).
                </td>
                <td>
                  <img width="300" src="/images/help/help-create-relationship.jpg" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Edit Class</th>
                <td>
                  To edit a class, double-click on it to open a popup where you can modify its components, such as the name,
                  attributes, and methods. For attributes, specify the type using formats like <code>+ attribute :
                    type</code>, <code>+ attribute</code>, or simply <code>attribute</code>, where the type can be a
                  primitive data type (int, float, str, bool, time, date, datetime, timedelta, or any) or a class/enum type. The default type is string.
                  Visibility can be set using <code>+</code> (public), <code>-</code> (private), or <code>#</code> (protected),
                  with public as the default. For methods, specify the return type in a format like <code>+ notify(sms: str = 'message')</code>,
                  which translates to a public method named <code>notify</code> with a parameter <code>sms</code>
                  of type <code>str</code> and a default value of <code>'message'</code>. Another example, <code>- findBook(title: str): Book</code>,
                  represents a private method named <code>findBook</code> that takes a title parameter of type <code>str</code> and
                  returns a <code>Book</code>. A method without parameters, such as <code>validate()</code>, would be defined
                  as public by default.
                </td>
                <td>
                  <img width="300" src="/images/help/help-update-element.jpg" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Edit Association or Generalization</th>
                <td>
                  To edit an Association or Generalization, double-click on it to open a popup where you can modify its properties. You can change the
                  association type (Unidirectional, Bidirectional, Composition) or switch to Generalization. For associations, you can assign a name, set
                  source and target end names, and modify the multiplicity at both ends.
                </td>
                <td>
                  <img width="300" src="/images/help/help-update-asso.jpg" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Delete Class</th>
                <td colSpan={2}>
                  To delete a class, select it with a single click and either press <code>Delete</code> or{' '}
                  <code>Backspace</code> on your keyboard.
                </td>
              </tr>
              <tr>
                <th>Move Class</th>
                <td>
                  To move a class, select it with a single click and either use your keyboard arrows or drag and drop it.
                </td>
                <td>
                  <img width="300" src="/images/help/help-move-element.jpg" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Undo & Redo</th>
                <td colSpan={2}>
                  With <code>Ctrl+Z</code> and <code>Ctrl+Y</code> you can undo and redo your changes.
                </td>
              </tr>
              <tr>
                <th>OCL Constraint</th>
                <td>
                  You can add OCL constraints to a class diagram by dragging and dropping the OCL shape onto your canvas.
                  Then, write the constraint using the format: <code>Context "class name" ... </code>. You can link
                  the constraint to a class (dotted line). The syntax of each OCL constraint is validated when you click the Quality Check button.
                  This feature is powered
                  by <a href="https://b-ocl-interpreter.readthedocs.io/en/latest/" target="_blank" rel="noopener noreferrer" className="text-link">B-OCL</a>,
                  our OCL interpreter.
                </td>
                <td>
                  <img width="300" src="/images/help/help-ocl-constraint.png" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Association Class</th>
                <td>
                  An Association Class is a model element that combines an association and a class. To create one, drag and drop the
                  Class shape onto the canvas. Then, link it to an existing association center point by dragging the dotted line from
                  the Class to the association. You can define attributes for the Association Class just like
                  a regular class.
                  Note: The Association Class is currently not supported by our code generators.
                </td>
                <td>
                  <img width="300" src="/images/help/help-association-class.png" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>More info</th>
                <td colSpan={2}>
                  You can access more info into the <a href="https://besser.readthedocs.io/en/latest/" target="_blank" rel="noopener noreferrer" className="text-link">BESSER documentation</a> or in the <a href="https://github.com/BESSER-PEARL/BESSER_WME_standalone" target="_blank" rel="noopener noreferrer" className="text-link">WME GitHub repository</a>.
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="table">
            <tbody>
              <tr>
                <th>Modeling BAF Agents</th>
                <td>
                  Here, you will see how to model BAF agents using the agent diagram editor. The agent diagram follows a state-machine like structure, where each agent state defines the different states an agent can find itself in. The agent states are linked to bodies, which define the behavior of an agent at a specific state.
                </td>
              </tr>
              <tr>
                <th>Add Agent State</th>
                <td>
                  To add an agent state, drag and drop the agent state element from the left panel onto the canvas.
                </td>
                <td>
                  <img width="400" src="/images/help/agent/help-agent-state.png" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Edit Agent State Body</th>
                <td>
                  To edit the body of an agent state, double-click on the agent state element. This will open a popup where you can define the body of the agent state.
                  In the agent diagram, you can define three types of actions: 
                    <ul>
                  <li>Text reply: simple reply messages which cause the agent to send a predefined text message to the user</li>
                  <li> LLM reply: will forward the user message to a Large Language Model and let it take care of responding and </li>
                <li> Python code will allow users to take care of defining the function to be executed when the state is reached using a python syntax</li>
                </ul>
                </td>
              
                <td>
                  <img width="400" src="/images/help/agent/help-agent-body.png" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Add Transition between States</th>
                <td>
                 Click on the outer part of the agent state element and drag it to another agent state element to create a transition. For a given state, this will allow you to specify the possible transitions.

                </td>
                <td>
                  <img width="400" src="/images/help/agent/help-agent-transition.png" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Set Transition Condition</th>
                <td>
                  Double-click on a transition to open a popup where you can define the condition for the transition. The condition is a boolean expression that determines when the transition should occur. You can use the following elements in the condition:
                  <ul>
                    <li>When Intent Matched: transition when a specified intent is recognized</li>
                    <li>When No Intent Matched: transition if no intent fits </li>
                    <li>Variable Operation Matched: transition when stored user session variable fullfills criteria </li>
                    <li>File Received: transition when a file is received </li>
                    <li>Auto Transition: immediately transition </li>
                  </ul>
                </td>
                <td>
                  <img width="400" src="/images/help/agent/help-agent-transition-body.png" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Set Initial State </th>
                <td>
                  To define your starting agent state, connect the initial state element to the agent state you want to start with. The initial state is the first state the agent will enter when it is activated.
                </td>
                <td>
                  <img width="400" src="/images/help/agent/help-agent-initial-state.png" alt="Image not found" />
                </td>
              </tr>
              <tr>
                <th>Defining Intents</th>
                <td>
                  To define the intents your agent is supposed to recognize, drag and drop the intent element from the left panel onto the canvas. You can then double-click on the intent element to open a popup where you can define the intent name and its training sentences. The training sentences are the phrases that users might say to trigger this intent.
                </td>
                <td>
                  <img width="400" src="/images/help/agent/help-agent-intent.png" alt="Image not found" />
                </td>
              </tr>

              <tr>
                <th>More info</th>
                <td colSpan={2}>
                  For more information about agent modeling, check the <a href="https://besser.readthedocs.io/en/latest/" target="_blank" rel="noopener noreferrer" className="text-link">BESSER documentation</a> or the <a href="https://github.com/BESSER-PEARL/BESSER_WME_standalone" target="_blank" rel="noopener noreferrer" className="text-link">WME GitHub repository</a>.
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </Modal.Footer>
    </>
  );
};
