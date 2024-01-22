const InjectProperty =
    <TProperty>(classProperty: TProperty) =>
        <This>(target: undefined, context: ClassFieldDecoratorContext<This, TProperty>) =>
            () =>
                classProperty;

export function MakePropertyInjector<TInstance>(instance: TInstance) {
    return InjectProperty(instance);
}

