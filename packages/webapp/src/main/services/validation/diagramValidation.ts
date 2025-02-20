import { ApollonEditor, UMLAssociation, UMLElement } from '@besser/wme';

interface ValidationResult {
  isValid: boolean;
  message: string;
}

interface UMLAttribute {
  name: string;
  type: string;
}

interface UMLMethod {
  name: string;
}

interface UMLClassElement extends UMLElement {
  type: 'Class';
  attributes?: UMLAttribute[];
  methods?: UMLMethod[];
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
      return `Class "${name}" appears ${ids.length} times`; // at ${positions.join(', ')}`;
    });

  return duplicates.length > 0
    ? { isValid: false, message: "❌ Duplicate class names found:\n" + duplicates.join('\n') }
    : { isValid: true, message: "✅ All class names are unique" };
}

export function validateClassStructure(editor: ApollonEditor): ValidationResult {
  if (!editor?.model) {
    return { isValid: false, message: "❌ Editor not initialized" };
  }

  const elements = editor.model.elements;
  const issues: string[] = [];

  for (const [id, element] of Object.entries(elements)) {
    if (element.type === 'Class') {
      const classElement = element as UMLClassElement;
      // Check for empty classes
      if (!classElement.attributes?.length && !classElement.methods?.length) {
        issues.push(`Class "${classElement.name}" has no attributes or methods`);
      }

      // Validate attribute format and types
      classElement.attributes?.forEach((attr: UMLAttribute) => {
        if (!attr.name?.trim()) {
          issues.push(`Class "${classElement.name}" has unnamed attribute`);
        }
        if (!attr.type?.trim()) {
          issues.push(`Attribute "${attr.name}" in class "${classElement.name}" has no type`);
        }
      });

      // Validate method format
      classElement.methods?.forEach((method: UMLMethod) => {
        if (!method.name?.trim()) {
          issues.push(`Class "${classElement.name}" has unnamed method`);
        }
      });
    }
  }

  return issues.length > 0
    ? { isValid: false, message: "❌ Class structure issues found:\n" + issues.join('\n') }
    : { isValid: true, message: "✅ All classes are properly structured" };
}

export function validateInheritanceCycles(editor: ApollonEditor): ValidationResult {
  if (!editor?.model) {
    return { isValid: false, message: "❌ Editor not initialized" };
  }

  const relationships = editor.model.relationships;
  const elements = editor.model.elements;
  const inheritanceMap = new Map<string, string[]>();
  
  // Build inheritance map
  for (const rel of Object.values(relationships)) {
    if (rel.type === 'ClassInheritance') {
      const inheritance = rel;
      const subClass = inheritance.source.element;
      const superClass = inheritance.target.element;
      
      if (!inheritanceMap.has(subClass)) {
        inheritanceMap.set(subClass, []);
      }
      inheritanceMap.get(subClass)?.push(superClass);
    }
  }

  // Check for cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(classId: string): boolean {
    if (recursionStack.has(classId)) return true;
    if (visited.has(classId)) return false;

    visited.add(classId);
    recursionStack.add(classId);

    const superClasses = inheritanceMap.get(classId) || [];
    for (const superClass of superClasses) {
      if (hasCycle(superClass)) return true;
    }

    recursionStack.delete(classId);
    return false;
  }

  const cycleFound = Array.from(inheritanceMap.keys()).some(classId => hasCycle(classId));

  return cycleFound
    ? { isValid: false, message: "❌ Inheritance cycle detected in the class hierarchy" }
    : { isValid: true, message: "✅ No inheritance cycles found" };
}

export function validateMultiplicities(editor: ApollonEditor): ValidationResult {
  if (!editor?.model) {
    return { isValid: false, message: "❌ Editor not initialized" };
  }

  const relationships = editor.model.relationships;
  const issues: string[] = [];

  for (const [id, rel] of Object.entries(relationships)) {
    if (rel.type === 'ClassBidirectional') {
      const association = rel as UMLAssociation;
      
      // Check source multiplicity format
      if (association.source.multiplicity &&
          !association.source.multiplicity.match(/^(\d+|\*|0\.\.\*|1\.\.\*|\d+\.\.\d+|\d+\.\.\*)$/)) {
        issues.push(`Invalid multiplicity format "${association.source.multiplicity}" in association ${association.name || id}`);
      }

      // Check target multiplicity format
      if (association.target.multiplicity &&
          !association.target.multiplicity.match(/^(\d+|\*|0\.\.\*|1\.\.\*|\d+\.\.\d+|\d+\.\.\*)$/)) {
        issues.push(`Invalid multiplicity format "${association.target.multiplicity}" in association ${association.name || id}`);
      }
    }
  }

  return issues.length > 0
    ? { isValid: false, message: "❌ Multiplicity format issues found:\n" + issues.join('\n') }
    : { isValid: true, message: "✅ All multiplicities are valid" };
}

export function validateDiagram(editor: ApollonEditor): ValidationResult {
  if (!editor?.model) {
    return { isValid: false, message: "⚠️ Editor is not properly initialized" };
  }

  if (Object.keys(editor.model.elements).length === 0) {
    return { isValid: false, message: "⚠️ The model is empty. Please add some elements before proceeding." };
  }

  // Run all validations
  const validations = [
    validateClassNames(editor),
    validateAssociationEnds(editor),
    // validateClassStructure(editor),
    validateInheritanceCycles(editor),
    validateMultiplicities(editor)
  ];

  // Collect all validation issues
  const failures = validations.filter(v => !v.isValid);
  if (failures.length > 0) {
    return {
      isValid: false,
      message: "❌ Validation failed:\n\n" + failures.map(f => f.message).join('\n\n')
    };
  }

  return { isValid: true, message: "✅ All validations passed" };
}
