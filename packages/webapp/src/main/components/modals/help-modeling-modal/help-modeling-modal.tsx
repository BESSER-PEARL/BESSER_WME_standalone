import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ModalContentProps } from '../application-modal-types';

export const HelpModelingModal: React.FC<ModalContentProps> = ({ close }) => (
  <>
    <Modal.Header closeButton>
      <Modal.Title>How to use this editor?</Modal.Title>
    </Modal.Header>
    <Modal.Body>
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
            <th>More info</th>
            <td colSpan={2}>
              You can access more info into the <a href="https://besser.readthedocs.io/en/latest/" target="_blank" rel="noopener noreferrer" className="text-link">BESSER documentation</a> or in the <a href="https://github.com/BESSER-PEARL/BESSER_WME_standalone" target="_blank" rel="noopener noreferrer" className="text-link">WME GitHub repository</a>.
            </td>
          </tr>
        </tbody>
      </table>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={close}>
        Close
      </Button>
    </Modal.Footer>
  </>
);
