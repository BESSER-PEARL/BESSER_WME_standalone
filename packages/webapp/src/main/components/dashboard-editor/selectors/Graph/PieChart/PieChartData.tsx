import { useNode } from '@craftjs/core';
import { ToolbarSection } from '../../../editor-bars/ToolbarSection';
import { ToolbarItem } from '../../../editor-bars/ToolbarItem';
import { getClassOptions, getAttributeOptionsByClassId, getEndsByClassId } from '../../../helpers/ClassData';

export const PieChartData = () => {
  const classOptions = getClassOptions();

  // Get selected class/attribute ids from Craft.js node props
  const { propValue: selectedClass } = useNode(node => ({
    propValue: node.data.props?.['class'],
  }));
  const { propValue: selectedAttributeGroups } = useNode(node => ({
    propValue: node.data.props?.['attributeGroups'],
  }));
  const { propValue: selectedAttributeValues } = useNode(node => ({
    propValue: node.data.props?.['attributeValues'],
  }));

  const attributeOptions = selectedClass ? getAttributeOptionsByClassId(selectedClass) : [];
  const endsOptions = selectedClass ? getEndsByClassId(selectedClass) : [];
  const combinedOptions = [...attributeOptions, ...endsOptions];

  return (
    <>
      <ToolbarSection title="Pie data" props={[selectedClass, selectedAttributeGroups, selectedAttributeValues]}>
        <ToolbarItem
          full
          propKey="class"
          type="select"
          label="Class"
          options={classOptions}
        />
        <ToolbarItem
          full
          propKey="groups"
          type="select"
          label="Groups"
          options={combinedOptions}
        />
        <ToolbarItem
          full
          propKey="values"
          type="select"
          label="Values"
          options={combinedOptions}
        />
      </ToolbarSection>
    </>
  );
};
