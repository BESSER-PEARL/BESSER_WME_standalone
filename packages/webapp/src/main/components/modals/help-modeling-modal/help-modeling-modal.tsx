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
              To add a class, simply drag and drop one of the elements on the right side into the editor area on the
              left side. 
            </td>
            <td>
              <img width="300" src="/images/help/help-create-element.png" alt="Image not found" />
            </td>
          </tr>
          <tr>
            <th>Add Association</th>
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
            <th>More info</th>
            <td colSpan={2}>
              You can access more info by <a href="https://besser.readthedocs.io/en/latest/" target="_blank" rel="noopener noreferrer" className="text-link">clicking here</a> to read the BESSER documentation.
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
