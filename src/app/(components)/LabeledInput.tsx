import { ComponentProps, ReactNode } from "react";
import { VStack } from "styled-system/jsx";
import { Text } from "~/components/ui/text";

export function LabeledInput({
    label,
    input,
    ...props
}:{
    label: string
    input: ReactNode
} & ComponentProps<typeof VStack>) {
    return (
        <VStack {...props}>
            <Text>{label}</Text>
            {input}
        </VStack>
    )
}