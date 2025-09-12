import { useNode } from '@craftjs/core';
import { ToolbarSection } from '../../../editor-bars/ToolbarSection';
import { ToolbarItem } from '../../../editor-bars/ToolbarItem';
import { getClassOptions, getAttributeOptionsByClassId, getEndsByClassId } from '../../../helpers/ClassData';
import { Class } from '@mui/icons-material';

export const LineChartData = () => {
  const classOptions = getClassOptions();

  // Get selected class/attribute ids from Craft.js node props
  const { propValue: selectedClass } = useNode(node => ({
    propValue: node.data.props?.['class'],
  }));
  const { propValue: selectedAttributeX } = useNode(node => ({
    propValue: node.data.props?.['attributeX'],
  }));
  const { propValue: selectedAttributeY } = useNode(node => ({
    propValue: node.data.props?.['attributeY'],
  }));

  const attributeOptions = selectedClass ? getAttributeOptionsByClassId(selectedClass) : [];
  const endsOptions = selectedClass ? getEndsByClassId(selectedClass) : [];
  const combinedOptions = [...attributeOptions, ...endsOptions];

  return (
    <>
      <ToolbarSection title="Axis" props={[selectedClass, selectedAttributeX, selectedAttributeY]}>
        <ToolbarItem
          full
          propKey="class"
          type="select"
          label="Class"
          options={classOptions}
        />
        <ToolbarItem
          full
          propKey="attributeX"
          type="select"
          label="X Axis"
          options={combinedOptions}
        />
        <ToolbarItem
          full
          propKey="attributeY"
          type="select"
          label="Y Axis"
          options={combinedOptions}
        />
      </ToolbarSection>
    </>
  );
};
