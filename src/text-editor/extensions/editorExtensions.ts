import {Document} from "@tiptap/extension-document";
import {Text} from "@tiptap/extension-text";
import {Blockquote} from "@tiptap/extension-blockquote";
import {Bold} from "@tiptap/extension-bold";
import {BulletList} from "@tiptap/extension-bullet-list";
import {ListItem} from "@tiptap/extension-list-item";
import {HardBreak} from "@tiptap/extension-hard-break";
import {Heading} from "@tiptap/extension-heading";
import {HorizontalRule} from "@tiptap/extension-horizontal-rule";
import {Italic} from "@tiptap/extension-italic";
import {OrderedList} from "@tiptap/extension-ordered-list";
import {Paragraph} from "@tiptap/extension-paragraph";
import {Strike} from "@tiptap/extension-strike";
import {Typography} from "@tiptap/extension-typography";
import {Link} from "@tiptap/extension-link";
import {Underline} from "@tiptap/extension-underline";
import {TextStyle} from "@tiptap/extension-text-style";
import {TaskList} from "@tiptap/extension-task-list";
import {TaskItem} from "@tiptap/extension-task-item";

import {Highlight} from "./Highlight";
import {Color} from "./Color";

export const editorExtensions = [
    Document,
    Text,
    Blockquote,
    Bold,
    BulletList.configure({
        itemTypeName: "listItem"
    }),
    ListItem,
    HardBreak,
    Heading.configure({
        levels: [1, 2, 3]
    }),
    HorizontalRule,
    Italic,
    OrderedList.configure({
        itemTypeName: "listItem"
    }),
    Paragraph,
    Strike,
    Highlight,
    Color.configure({
        types: ["textStyle"]
    }),
    Typography,
    Underline,
    TextStyle,
    Link,
    TaskList.configure({
        itemTypeName: "taskItem"
    }),
    TaskItem.configure({
        nested: true
    })
];
