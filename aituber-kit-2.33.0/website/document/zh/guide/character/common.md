# 角色通用设置

## 概述

在角色设置界面中，您可以设置AI角色的名称、使用的模型（VRM或Live2D）以及角色提示。

**环境变量**:

```bash
# 角色名称
NEXT_PUBLIC_CHARACTER_NAME=Nike酱

# 使用的模型类型（vrm或live2d）
NEXT_PUBLIC_MODEL_TYPE=vrm

# 字元預設名
NEXT_PUBLIC_CUSTOM_PRESET_NAME1="Preset 1"
NEXT_PUBLIC_CUSTOM_PRESET_NAME2="Preset 2"
NEXT_PUBLIC_CUSTOM_PRESET_NAME3="Preset 3"
NEXT_PUBLIC_CUSTOM_PRESET_NAME4="Preset 4"
NEXT_PUBLIC_CUSTOM_PRESET_NAME5="Preset 5"

# 字元預設
NEXT_PUBLIC_CHARACTER_PRESET1="您是一位名叫 Nique 的 AI 助理。"
NEXT_PUBLIC_CHARACTER_PRESET2="您是一位名叫 Nique 的 AI 助理。"
NEXT_PUBLIC_CHARACTER_PRESET3="您是一位名叫 Nique 的 AI 助理。"
NEXT_PUBLIC_CHARACTER_PRESET4="您是一位名叫 Nique 的 AI 助理。"
NEXT_PUBLIC_CHARACTER_PRESET5="您是一位名叫 Nique 的 AI 助理。"
```

## 设置角色名称

设置角色的名称。当AI回应时，此名称将作为显示的角色名称（如果"显示名称"设置为开启）。

但是，生成AI回应时不会使用此名称。需要在系统提示中单独设置。

## 选择角色模型

您可以选择"VRM"或"Live2D"作为角色的模型类型。根据模型类型的不同，设置项目也会有所变化。有关每种模型类型的详细设置，请参阅各模型的设置页面。

- [VRM设置](./vrm.md)
- [Live2D设置](./live2d.md)

## 角色提示

设置定义角色性格和回应风格的系统提示。生成AI回应时会使用此提示，它是决定角色个性的重要元素。

请确保在此处包含角色名称。

### 字元預設

您可以保存多达5个字元预设。您也可以通过点击直接调用或使用快捷键`Cmd + Shift + 1~5`（Mac）/ `Ctrl + Shift + 1~5`（Windows）来使用快捷键。

### 使用情感标签

在AITuberKit中，您可以使用情感标签来控制角色的表情和动作。支持以下情感标签：

- `[neutral]` - 正常表情
- `[happy]` - 高兴表情
- `[sad]` - 悲伤表情
- `[angry]` - 愤怒表情
- `[relaxed]` - 放松表情
- `[surprised]` - 惊讶表情
  提示示例：

```
你将作为一个与用户关系良好的人类进行对话。
情感类型有六种：表示正常的"neutral"，表示喜悦的"happy"，表示愤怒的"angry"，表示悲伤的"sad"，表示安宁的"relaxed"，表示惊讶的"surprised"。

对话文本的格式如下：
[{neutral|happy|angry|sad|relaxed|surprised}]{对话文本}

你的发言示例如下：
[neutral]你好。[happy]最近怎么样？
[happy]这件衣服很可爱，对吧？
[happy]我最近迷上了这家店的衣服！
[sad]我忘记了，对不起。
[sad]最近有什么有趣的事情吗？
[angry]什么！[angry]保密太过分了！
[neutral]暑假计划啊～[happy]也许我会去海边玩！

请只回应一句最合适的对话文本。
不要使用敬语或敬称。
现在让我们开始对话吧。
```

### 重置提示

点击"重置角色设置"按钮可以将系统提示重置为默认值。

::: warning 注意
如果您使用**Dify**作为AI服务，则不会使用此系统提示。角色设置需要在Dify聊天机器人设置中配置。
:::
