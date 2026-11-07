window.__ModuleLoader__.load({
	id: "dsh-client-ui-model-label",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region lib/types/client/index.js
		/**
		 * Non-interactive composer model label: the provider id, a slash, then the
		 * model id, so two providers that ship the same model id stay distinct.
		 * @param props - host-supplied catalog data for the current selection.
		 * @returns the label text.
		 */
		function ModelLabel({ provider, model }) {
			return `${provider.id}/${model.id}`;
		}
		/** Required service: the UI slot registry. */
		const inject = ["slots"];
		/**
		 * Fill the inline model-label slot declared by ui-model-selection. The
		 * declaration is session-scoped and appears while the composer is
		 * mounted; `slots.inject` reruns this registration whenever it collapses
		 * and reappears.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			ctx.slots.inject("conversation.input.model.label", () => ctx.slots.register({
				name: "conversation.input.model.label"
			}, ModelLabel));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
