# dsh-client-ui-model-label

把 DSH Web 输入框里的模型标签显示为 `provider/model`
（例如 `opencode-go/deepseek-v4.1-flash`），而不是只显示模型显示名。

它占用官方 `@deepseek-ai/dsh-client-ui-model-selection` 声明的
`conversation.input.model.label` 插槽，属于纯前端贡献，不改变模型选择逻辑，也不接触凭据。

本包同时是一个 **DSH 组合包（bundle）**：既能被 profile 选中/取消选中，
也能在 Web 的「插件」页里开关，从而控制“导入”和“启用”。

## 目录结构

```
.
├── package.json        # 双重身份：dsh.bundle（配置层）+ dsh.client（浏览器半）
├── cordis.patch.yml    # 组合包层：insert 自己的插件行
├── lib/
│   ├── index.js        # 宿主半：空实现，只为让 Loader 有一行可挂载的条目
│   └── client.js       # 浏览器半：window.__ModuleLoader__.load({ id, factory })
├── README.md
├── LICENSE
└── .gitignore
```

## 为什么没有构建步骤

DSH 宿主直接把这个包导出的 `./client` 当作浏览器 bundle 提供，浏览器端只要求
`window.__ModuleLoader__.load({ id, factory })` 这一种注册形式。本插件零依赖、
不使用 JSX，所以 `lib/client.js` 就是可交付产物，不需要 tsdown/rollup。

约定：`load({ id })` 的 `id` 必须等于包名；`exports["./client"]` 必须指向该文件。

## 安装到 profile

### 方式一：作为组合包（推荐，可被 GUI 开关）

把本项目装进 profile（依赖 + 组合包选择）。有 pnpm 时：

```sh
dsh plugin --profile web add /home/fyq/Documents/dev/dsh/dsh-client-ui-model-label
```

没有 pnpm 时，等价的手工接线是：

1. `~/.dsh/profiles/web/package.json` 的 `dependencies` 增加
   `"dsh-client-ui-model-label": "link:/home/fyq/Documents/dev/dsh/dsh-client-ui-model-label"`；
2. 同一文件的 `dsh.profile.bundles` 列表末尾加入 `dsh-client-ui-model-label`；
3. 建软链 `~/.dsh/profiles/web/node_modules/dsh-client-ui-model-label -> /home/fyq/Documents/dev/dsh/dsh-client-ui-model-label`。

组合包层 `cordis.patch.yml` 会插入唯一一行：

```yaml
- insert:
    - id: client-ui-model-label
      name: dsh-client-ui-model-label
```

## 导入与启用的控制点

1. **组合包选择**（是否导入这一层）：profile `package.json` 的 `dsh.profile.bundles`。
   - Web：侧边栏「插件」页对应条目的开关；
   - Agent：`plugin_manager` 工具的 `set_bundle`；
   - 关闭只取消配置层，依赖保留，代码不再加载。
2. **单行启停**（这一层里是否挂载该插件）：同一「插件」页里按行开关，
   实现方式是在 profile `cordis.patch.yml` 追加 `- id: client-ui-model-label` + `disabled: true`，优先级高于组合包层。
3. **彻底移除**：`dsh plugin --profile web remove dsh-client-ui-model-label`
   （或删掉依赖、`bundles` 条目和 `node_modules` 软链）。

启用 HMR 的 profile（随附 `web` 模板即是）保存后立即生效；否则重启 `dsh web`。

## 行为与限制

- 生效位置：输入框下方的模型按钮、下拉菜单里的当前值、以及每个模型选项行。
- 推理强度后缀（如 `· 低`）由官方组件单独渲染，不受影响。
- 已知取舍：插槽占用是整体替换，模型条目原有的 badge（如 new 标签）不再显示；
  按钮的 `title` / aria 文案仍走官方回退（只含模型显示名）。
- 只读展示，不注册工具、提示词或服务。

## 调试

- 浏览器打开 DSH → 侧边栏「插件」页可看到本组合包；「设置 → 插件」是只读列表，会显示加载/渲染错误。
- 宿主是否已组合该行，可用 bundle revision URL 验证：
  `/plugins/??dsh-client-ui-model-label/client.js&rev=<按 mtime/ctime/size 算出的 12 位 hash>`。
- `dsh --profile web --dump-config` 可查看组合后的行及其来源层。

## 通过 GitHub 分发

### 建仓库

```sh
cd /home/fyq/Documents/dev/dsh/dsh-client-ui-model-label
# 在 GitHub 建一个空仓库（不要勾选初始化 README），然后：
git remote add origin git@github.com:<you>/dsh-client-ui-model-label.git
git push -u origin main
git push origin v0.1.0
```

本地已经做好 `git init`、初始提交和 `v0.1.0` 标签；CI 会在推送 tag 时
`npm pack` 并把 tarball 挂到 GitHub Release。

### 别人怎么安装

```sh
# 1) git，跟随 main 最新
dsh plugin --profile web add git+https://github.com/<you>/dsh-client-ui-model-label.git

# 2) git，固定到 tag / commit（推荐）
dsh plugin --profile web add git+https://github.com/<you>/dsh-client-ui-model-label.git#v0.1.0

# 3) GitHub Release 里的 tarball
dsh plugin --profile web add https://github.com/<you>/dsh-client-ui-model-label/releases/download/v0.1.0/dsh-client-ui-model-label-0.1.0.tgz

# 4) 之后若发布到 npm
dsh plugin --profile web add dsh-client-ui-model-label
```

git 与 tarball 安装同样会出现在「插件」页，可以启用/停用和移除；但插件管理器的
版本更新（`updateBundle`）只支持 npm registry 安装的包，git/tarball 需要手工重装。

### 在「发现」页展示（可选）

插件市场的索引是一份自托管的 format 1 JSON：放到 GitHub Pages 或任意 HTTPS 地址，
用户在 设置 → 插件 → 发现 里添加该 URL。最小示例：

```json
{
  "format": 1,
  "title": "My DSH plugins",
  "metadata": {},
  "plugins": [
    {
      "name": "dsh-client-ui-model-label",
      "title": "Provider/model model label",
      "description": "Show the DSH composer model label as provider/model.",
      "metadata": {},
      "versions": [
        {
          "version": "0.1.0",
          "publishTimestamp": 1794000000,
          "source": {
            "type": "git",
            "url": "https://github.com/<you>/dsh-client-ui-model-label",
            "commit": "<40 位 commit SHA>"
          },
          "engines": { "dsh": ">=0.2.2-0" }
        }
      ]
    }
  ]
}
```

字段以 `@deepseek-ai/dsh-plugin-market-index` 的 format 1 校验器为准；该展示需要
启用插件市场组合包。

## 发布到 npm（可选，但更新体验最好）

```sh
cd /home/fyq/Documents/dev/dsh/dsh-client-ui-model-label
npm login
npm publish            # 首次发布后别人即可 dsh plugin add dsh-client-ui-model-label
npm version patch && git push --follow-tags
```

发布前检查：`npm pack --dry-run` 只应包含 `lib/`、`cordis.patch.yml`、`locale/`、
`icon.svg`、`README.md`、`LICENSE`、`package.json`；`package.json` 不能有
`private: true`（当前已移除）。
