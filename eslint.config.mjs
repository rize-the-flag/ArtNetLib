import eslint from '@eslint/js';
import tseslint from 'typescript-eslint'

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                project: ['./tsconfig.json', './packages/*/tsconfig.json'],
            }
        }
    },
    {
        files: ['./**/*.d.ts', './**/build/*', './**/*.js'],
        ...tseslint.configs.disableTypeChecked,
    },
    {
        rules: {
            '@typescript-eslint/no-unnecessary-type-parameters': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'no-undef': 'off',
            '@typescript-eslint/no-unused-expressions': 'warn',
            '@typescript-eslint/unified-signatures': 'warn'
        }
    }
)




