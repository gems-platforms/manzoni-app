
import {QwenIcon} from "./QwenIcon";
import {MistralIcon} from "./MistralIcon";
import {GraniteIcon} from "./GraniteIcon";
import {LlamaIcon} from "./LlamaIcon";
import {GemmaIcon} from "./GemmaIcon";
import {PhiIcon} from "./PhiIcon";
import {DeepseekIcon} from "./DeepseekIcon";

export function getModelIcon(modelType: string, width?: string | number, height?: string | number) {
    switch (modelType) {
        case "phi":
            return <PhiIcon width={width} height={height} />;
        case "gemma":
            return <GemmaIcon width={width} height={height} />;
        case "llama":
            return <LlamaIcon width={width} height={height} />;
        case "qwen":
            return <QwenIcon width={width} height={height} />;
        case "mistral":
            return <MistralIcon width={width} height={height} />;
        case "granite":
            return <GraniteIcon width={width} height={height} />;
        case "deepseek":
            return <DeepseekIcon width={width} height={height} />;
        default:
            return;
    }
};
