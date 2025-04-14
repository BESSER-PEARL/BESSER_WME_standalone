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
  const classNameMap = new Map<string, { ids: string[], originalNames: string[] }>();

  for (const [id, element] of Object.entries(elements)) {
    if (element.type === 'Class') {
      const lowerCaseName = element.name.toLowerCase();
      const originalName = element.name;
      
      if (!classNameMap.has(lowerCaseName)) {
        classNameMap.set(lowerCaseName, { ids: [], originalNames: [] });
      }
      
      const entry = classNameMap.get(lowerCaseName)!;
      entry.ids.push(id);
      entry.originalNames.push(originalName);
    }
  }

  const duplicates = Array.from(classNameMap.entries())
    .filter(([, { ids }]) => ids.length > 1)
    .map(([, { ids, originalNames }]) => {
      // Use first original name for the message (they're all case-insensitively equal)
      const representativeName = originalNames[0];
      return `Class "${representativeName}" appears ${ids.length} times`;
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

export function validateAssociationClassConstraints(editor: ApollonEditor): ValidationResult {
  if (!editor?.model) {
    return { isValid: false, message: "❌ Editor not initialized" };
  }

  const relationships = editor.model.relationships;
  const elements = editor.model.elements;
  const issues: string[] = [];
  
  // First, check that ClassLinkRel only connects an association to a class
  for (const [id, rel] of Object.entries(relationships)) {
    if (rel.type === 'ClassLinkRel') {
      const sourceId = rel.source.element;
      const targetId = rel.target.element;
      
      // Check if one side is a relationship (should be an association) and the other is a class
      // This handles both orientations (association→class and class→association)
      const sourceIsAssociation = relationships[sourceId] !== undefined;
      const targetIsAssociation = relationships[targetId] !== undefined;
      const sourceIsClass = elements[sourceId]?.type === 'Class';
      const targetIsClass = elements[targetId]?.type === 'Class';
      
      // Valid cases: (association→class) or (class→association)
      const isValid = (sourceIsAssociation && targetIsClass) || (sourceIsClass && targetIsAssociation);
      
      if (!isValid) {
        if (!sourceIsAssociation && !sourceIsClass) {
          issues.push(`Invalid link relationship: source element is neither a class nor an association`);
        }
        if (!targetIsAssociation && !targetIsClass) {
          issues.push(`Invalid link relationship: target element is neither a class nor an association`);
        }
        if ((sourceIsClass && targetIsClass) || (sourceIsAssociation && targetIsAssociation)) {
          issues.push(`Invalid link relationship: must connect an association to a class, not ${
            sourceIsClass && targetIsClass ? 'class to class' : 'association to association'
          }`);
        }
      }
    }
  }
  
  // Step 1: Find all association classes (classes linked to associations via ClassLinkRel)
  const associationClasses = new Map<string, string>(); // Map<associationId, classId>
  // Track associations that have multiple association classes linked to them
  const associationLinkCount = new Map<string, number>();
  
  for (const [id, rel] of Object.entries(relationships)) {
    if (rel.type === 'ClassLinkRel') {
      const sourceId = rel.source.element;
      const targetId = rel.target.element;
      
      // Handle both orientations: association→class or class→association
      let associationId, classId;
      
      if (relationships[sourceId] && elements[targetId]?.type === 'Class') {
        // Case: association→class
        associationId = sourceId;
        classId = targetId;
      } else if (relationships[targetId] && elements[sourceId]?.type === 'Class') {
        // Case: class→association
        associationId = targetId;
        classId = sourceId;
      } else {
        // Not a valid association-class link
        continue;
      }
      
      // Count associations with multiple links
      associationLinkCount.set(associationId, (associationLinkCount.get(associationId) || 0) + 1);
      
      // Store the association class relationship
      associationClasses.set(associationId, classId);
    }
  }
  
  // Check for associations with multiple association classes
  for (const [associationId, count] of associationLinkCount.entries()) {
    if (count > 1) {
      const associationName = relationships[associationId]?.name || 'Unknown';
      issues.push(
        `Association "${associationName}"  has ${count} association classes. An association can only have one association class.`
      );
    }
  }
  
  // Step 2: For each association class, get the connected regular classes
  for (const [associationId, classId] of associationClasses.entries()) {
    const association = relationships[associationId];
    if (!association) continue;
    
    // Get the elements connected by this association
    const connectedClasses = new Set<string>([
      association.source.element,
      association.target.element
    ]);
    
    // Check if the association class itself is one of the classes connected by the association
    // This is an invalid pattern in UML - a class cannot be both an association class and a participant in the same association
    if (connectedClasses.has(classId)) {
      const className = elements[classId]?.name || 'Unknown';
      issues.push(
        `Class "${className}" is both a participant in an association and serves as the association class for that same association`
      );
    }
    
    // Step 3: Check if any of these connected classes have other direct connections
    for (const connectedClassId of connectedClasses) {
      for (const [relId, rel] of Object.entries(relationships)) {
        // Skip the current association and any ClassLinkRel
        if (relId === associationId || rel.type === 'ClassLinkRel') continue;
        
        // Check if this relationship connects the class to another class
        if ((rel.source.element === connectedClassId || rel.target.element === connectedClassId) && 
            (rel.type === 'ClassBidirectional' || rel.type === 'ClassUnidirectional')) {
          const className = elements[connectedClassId]?.name || 'Unknown';
          issues.push(
            `Class "${className}" is connected to an association class but also has direct connections to other classes`
          );
          break; // Only report once per class
        }
      }
    }
  }
  
  return issues.length > 0
    ? { isValid: false, message: "❌ Association class constraint violations found:\n" + issues.join('\n') }
    : { isValid: true, message: "✅ All association class constraints satisfied" };
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
    // validateAssociationEnds(editor),
    // validateClassStructure(editor),
    validateInheritanceCycles(editor),
    validateMultiplicities(editor),
    validateAssociationClassConstraints(editor) // Add the new validation
  ];

  // Collect all validation issues
  const failures = validations.filter(v => !v.isValid);
  if (failures.length > 0) {
    return {
      isValid: false,
      message: "\n\n" + failures.map(f => f.message).join('\n\n')
    };
  }

  return { isValid: true, message: "✅ All validations passed" };
}
