import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Todo,
  addTodo,
  deleteTodo,
  getTodos,
  initDB,
  updateTodo,
} from "../services/todoService";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        await reload();
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function reload() {
    const data = await getTodos();
    setTodos(data);
  }

  async function handleAddOrUpdate() {
    if (!text.trim()) return;
    setIsSaving(true);
    try {
      if (editingId !== null) {
        await updateTodo(editingId, { text: text.trim() });
        setEditingId(null);
      } else {
        await addTodo(text.trim());
      }
      setText("");
      Keyboard.dismiss();
      await reload();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", (e as Error).message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(item: Todo) {
    try {
      await updateTodo(item.id!, { done: item.done ? 0 : 1 });
      await reload();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", (e as Error).message || "Could not toggle todo");
    }
  }

  function formatUTC7(ts?: string) {
    if (!ts) return "";
    try {
      const iso = ts.replace(" ", "T") + "Z"; // treat as UTC
      const d = new Date(iso);
      const d7 = new Date(d.getTime() + 7 * 60 * 60 * 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      const y = d7.getUTCFullYear();
      const m = pad(d7.getUTCMonth() + 1);
      const day = pad(d7.getUTCDate());
      const hh = pad(d7.getUTCHours());
      const mm = pad(d7.getUTCMinutes());
      return `${y}-${m}-${day} ${hh}:${mm}`;
    } catch (e) {
      return ts;
    }
  }

  function startEdit(item: Todo) {
    setEditingId(item.id ?? null);
    setText(item.text);
  }

  async function handleComplete(item: Todo) {
    setIsSaving(true);
    try {
      const newDone = item.done ? 0 : 1;
      await updateTodo(item.id!, { done: newDone });
      if (newDone === 1) setFilter("completed");
      else setFilter("active");
      await reload();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", (e as Error).message || "Could not update todo");
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(item: Todo) {
    Alert.alert("Delete Todo", "Are you sure you want to delete?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTodo(item.id!);
            await reload();
          } catch (e) {
            console.error(e);
            Alert.alert(
              "Error",
              (e as Error).message || "Could not delete todo"
            );
          }
        },
      },
    ]);
  }

  function renderItem({ item }: { item: Todo }) {
    return (
      <View style={styles.itemRow}>
        <TouchableOpacity
          onPress={() => handleToggle(item)}
          style={{ flex: 1 }}
        >
          <Text style={[styles.itemText, item.done ? styles.doneText : null]}>
            {item.text}
          </Text>
          <Text style={styles.metaText}>
            Created: {formatUTC7(item.created_at)}
          </Text>
          {item.completed_at ? (
            <Text style={styles.metaText}>
              Completed: {formatUTC7(item.completed_at)}
            </Text>
          ) : null}
        </TouchableOpacity>
        <View style={styles.btnWrap}>
          <Button
            color={item.done ? "#6c757d" : "#28a745"}
            title={item.done ? "Undo" : "Complete"}
            onPress={() => handleComplete(item)}
            disabled={isSaving}
          />
        </View>
        <View style={{ width: 8 }} />
        <View style={styles.btnWrap}>
          <Button title="Edit" onPress={() => startEdit(item)} />
        </View>
        <View style={{ width: 8 }} />
        <View style={styles.btnWrap}>
          <Button
            color="#d9534f"
            title="Delete"
            onPress={() => confirmDelete(item)}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todos (SQLite)</Text>

      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {todos.filter((t) => t.done === 0).length} active,{" "}
          {todos.filter((t) => t.done === 1).length} completed
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Write a todo..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <View style={styles.btnAdd}>
          <Button
            title={editingId !== null ? "Save" : "Add"}
            onPress={handleAddOrUpdate}
            disabled={isSaving || !text.trim()}
          />
        </View>
        {editingId !== null && (
          <>
            <View style={{ width: 8 }} />
            <View style={styles.btnAdd}>
              <Button
                title="Cancel"
                color="#6c757d"
                onPress={() => {
                  setEditingId(null);
                  setText("");
                }}
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" ? styles.filterButtonActive : null,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "all" ? styles.filterButtonTextActive : null,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "active" ? styles.filterButtonActive : null,
          ]}
          onPress={() => setFilter("active")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "active" ? styles.filterButtonTextActive : null,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "completed" ? styles.filterButtonActive : null,
          ]}
          onPress={() => setFilter("completed")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === "completed" ? styles.filterButtonTextActive : null,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos.filter((t) => {
          if (filter === "all") return true;
          if (filter === "active") return t.done === 0;
          return t.done === 1;
        })}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center" }}>
            {filter === "active"
              ? "No active todos"
              : filter === "completed"
              ? "No completed todos yet"
              : "No todos yet."}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
  },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  itemText: { fontSize: 16 },
  doneText: { textDecorationLine: "line-through", color: "#999" },
  metaText: { fontSize: 12, color: "#666" },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 6,
    backgroundColor: "#f0f0f0",
  },
  filterButtonActive: { backgroundColor: "#007bff" },
  filterButtonText: { color: "#333", fontSize: 13 },
  filterButtonTextActive: { color: "#fff" },
  btnWrap: { width: 84, height: 36, justifyContent: "center" },
  btnAdd: { width: 72, height: 36, justifyContent: "center" },
  countRow: { marginBottom: 8, alignItems: "center" },
  countText: { fontSize: 13, color: "#666" },
});
