import React, {useEffect, useState} from "react";

import EnterInput from "../../components/EnterInput";

import {
    StyledDeleteIcon,
    StyledEditorMenuContainer
} from "../../styled";

interface Editor {
    getAttributes: (name: string) => {href: string},
    command: (args: {editor: Editor, url?: string}) => void
}

interface Item {
    action: "add" | "remove",
    command: (args: {editor: Editor, url?: string}) => void
}

interface CommandsLinkProps {
    editor: Editor,
    items: Item[]
}

export default function CommandsLink({editor, items}: CommandsLinkProps) {
    const [url, setUrl] = useState("");

    useEffect(() => {
        function url() {
            if (editor.getAttributes("link").href) {
                setUrl(editor.getAttributes("link").href);
            } else {
                setUrl("");
            }
        }

        url();
    }, [editor]);

    function addLink(newUrl: string) {
        // cancelled
        if (newUrl === null || newUrl === "") {
            return;
        }

        const urlValidator = new RegExp(
            "https?://(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)"
        );

        const item = items.find((i) => i.action === "add");
        const validUrl = urlValidator.test(newUrl) ? newUrl : (`https://${newUrl}`);

        item?.command({editor: editor, url: validUrl});
    }

    function deleteLink() {
        const item = items.find((i) => i.action === "remove");
        item?.command({editor: editor});
    }

    return (
        <StyledEditorMenuContainer style={{
            padding: "5px 15px"
        }}
        >
            <div style={{
                width: 340,
                marginRight: 10
            }}
            >
                <EnterInput
                    placeholder="Paste link from the web"
                    type="url"
                    value={url}
                    onEnter={(url) => addLink(url)}
                />
            </div>
            <StyledDeleteIcon
                $visible={true}
                size={18}
                onClick={() => deleteLink()}
            />
        </StyledEditorMenuContainer>
    );
}
