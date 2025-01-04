import { eslintConfig } from "@bluzzi/eslint-config";

export default eslintConfig(
  {
    typescript: { tsconfigPath: "./tsconfig.json" },
  },
  {
    rules: {
      "no-await-in-loop": "off",
    },
  },
);
