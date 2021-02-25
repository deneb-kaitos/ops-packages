import which from 'which';
import {
  requiredTools,
} from '../../constants/requiredTools.mjs';
import {
  debuglog,
} from '../../helpers/debuglog.mjs';

const resolveTool = async (toolName = null) => {
  try {
    return await which(toolName);
  } catch (error) {
    debuglog(error.message);
  }

  return null;
};

export const tools = async () => {
  const result = {};

  for await (const requiredTool of requiredTools) {
    result[requiredTool] = (await resolveTool(requiredTool));
  }

  return Object.freeze(result);
};
