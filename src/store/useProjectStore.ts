import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProjectParams, ProjectResults, CapexItem, OpexFactor } from "../../shared/engine/types";
import { DEFAULT_PARAMS } from "../../shared/engine/constants";
import { calcularTodo } from "../../shared/engine/calculator";

interface ProjectState {
  params: ProjectParams;
  results: ProjectResults;
  updateParam: <K extends keyof ProjectParams>(
    key: K,
    value: ProjectParams[K]
  ) => void;
  updateCapexItem: (
    index: number,
    field: keyof Pick<CapexItem, "cantidad" | "costoUnitario">,
    value: number
  ) => void;
  updateOpexFactor: (
    index: number,
    field: keyof Pick<OpexFactor, "gas" | "bc">,
    value: number
  ) => void;
  resetParams: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      params: structuredClone(DEFAULT_PARAMS),
      results: calcularTodo(structuredClone(DEFAULT_PARAMS)),

      updateParam: (key, value) =>
        set((state) => {
          const newParams = { ...state.params, [key]: value };
          return { params: newParams, results: calcularTodo(newParams) };
        }),

      updateCapexItem: (index, field, value) =>
        set((state) => {
          const newItems = state.params.capexItems.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          );
          const newParams = { ...state.params, capexItems: newItems };
          return { params: newParams, results: calcularTodo(newParams) };
        }),

      updateOpexFactor: (index, field, value) =>
        set((state) => {
          const newFactors = state.params.opexFactors.map((f, i) =>
            i === index ? { ...f, [field]: value } : f
          );
          const newParams = { ...state.params, opexFactors: newFactors };
          return { params: newParams, results: calcularTodo(newParams) };
        }),

      resetParams: () =>
        set(() => {
          const params = structuredClone(DEFAULT_PARAMS);
          return { params, results: calcularTodo(params) };
        }),
    }),
    {
      name: "2025bc-project-store",
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version !== 1) {
          // Reset to defaults if schema changed
          const params = structuredClone(DEFAULT_PARAMS);
          return { params, results: calcularTodo(params) };
        }
        return persistedState as ProjectState;
      },
    }
  )
);
