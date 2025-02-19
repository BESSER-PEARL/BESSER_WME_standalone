import { ApollonEditor, UMLAssociation } from '@besser/besser-wme';

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function validateAssociationEnds(editor: ApollonEditor): ValidationResult {
  if (!editor?.model) {
    return { isValid: false, message: "❌ Editor not initialized" };
  }

  const relationships = editor.model.relationships;
  const invalidAssociations: string[] = [];
  const elements = editor.model.elements;

  for (const [, rel] of Object.entries(relationships)) {
    if (rel.type === 'ClassBidirectional') {
      const association = rel as UMLAssociation;
      const sourceClass = elements[association.source.element]?.name || 'Unknown';
      const targetClass = elements[association.target.element]?.name || 'Unknown';
      
      if (!association.source.role?.trim()) {
        invalidAssociations.push(
          `Association ${association.name || 'Unnamed'} (${sourceClass} → ${targetClass}): missing role name from ${sourceClass}`
        );
      }
      if (!association.target.role?.trim()) {
        invalidAssociations.push(
          `Association ${association.name || 'Unnamed'} (${sourceClass} → ${targetClass}): missing role name from ${targetClass}`
        );
      }
    }
  }

  return invalidAssociations.length > 0
    ? { isValid: false, message: "❌ Missing association role names:\n" + invalidAssociations.join('\n') }
    : { isValid: true, message: "✅ All associations have valid role names" };
}

export function validateClassNames(editor: ApollonEditor): ValidationResult {
  if (!editor?.model) {
    return { isValid: false, message: "❌ Editor not initialized" };
  }

  const elements = editor.model.elements;
  const classNames = new Map<string, string[]>();

  for (const [id, element] of Object.entries(elements)) {
    if (element.type === 'Class') {
      const name = element.name.toLowerCase();
      if (!classNames.has(name)) {
        classNames.set(name, []);
      }
      classNames.get(name)?.push(id);
    }
  }

  const duplicates = Array.from(classNames.entries())
    .filter(([, ids]) => ids.length > 1)
    .map(([name, ids]) => {
      const positions = ids.map(id => {
        const element = elements[id];
        return `(${Math.round(element.bounds.x)}, ${Math.round(element.bounds.y)})`;
      });
      return `Class "${name}" appears ${ids.length} times at positions: ${positions.join(', ')}`;
    });

  return duplicates.length > 0
    ? { isValid: false, message: "❌ Duplicate class names found:\n" + duplicates.join('\n') }
    : { isValid: true, message: "✅ All class names are unique" };
}

export function validateDiagram(editor: ApollonEditor): ValidationResult {
  if (!editor?.model) {
    return { isValid: false, message: "⚠️ Editor is not properly initialized" };
  }

  if (Object.keys(editor.model.elements).length === 0) {
    return { isValid: false, message: "⚠️ The model is empty. Please add some elements before proceeding." };
  }

  const classNameResult = validateClassNames(editor);
  if (!classNameResult.isValid) {
    return classNameResult;
  }

  const associationResult = validateAssociationEnds(editor);
  if (!associationResult.isValid) {
    return associationResult;
  }

  return { isValid: true, message: "✅ Diagram validation passed" };
}
