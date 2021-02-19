import which from 'which';
import {
  requiredTools,
} from '../../constants/requiredTools.mjs';

const resolveTool = async (toolName = null, debuglog = null) => {
  try {
    return await which(toolName);
  } catch (error) {
    debuglog(error.message);
  }

  return null;
};

export const tools = async (debuglog = null) => {
  const result = {};

  for await (const requiredTool of requiredTools) {
    result[requiredTool] = (await resolveTool(requiredTool, debuglog));
  }

  return Object.freeze(result);
};
