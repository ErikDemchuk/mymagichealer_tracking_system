"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, GripVertical, Package, MoreVertical, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InventoryItem {
  id: string;
  crateId: string | null;
  itemType: string;
  batch: string;
  units: number;
  size: string;
}

interface ProductSubGroup {
  id: string;
  name: string;
  product: string;
  items: InventoryItem[];
}

interface LocationGroup {
  id: string;
  location: string;
  subGroups: ProductSubGroup[];
}

interface CollapsibleInventoryTableProps {
  data?: LocationGroup[];
}

const LocationGroupRow: React.FC<{
  group: LocationGroup;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ group, isExpanded, onToggle, isSelected, onSelect }) => {
  const totalItems = group.subGroups.reduce((acc, sg) => acc + sg.items.length, 0);
  
  return (
    <motion.tr
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 hover:bg-amber-100 transition-colors border-b border-gray-200"
    >
      <td className="p-3 w-12">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </div>
      </td>
      <td className="p-3" colSpan={5}>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onToggle}
            className="p-1 hover:bg-amber-200 rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </motion.div>
          </motion.button>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <MapPin className="w-5 h-5 text-amber-700" />
          <span className="font-semibold text-gray-900">Location: {group.location}</span>
          <span className="text-sm text-gray-500">({totalItems} items)</span>
        </div>
      </td>
      <td className="p-3 w-12 text-right">
        <button className="text-sm text-gray-500 hover:text-gray-700">+ Add item</button>
      </td>
    </motion.tr>
  );
};

const SubGroupRow: React.FC<{
  subGroup: ProductSubGroup;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ subGroup, isExpanded, onToggle, isSelected, onSelect }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white hover:bg-gray-50 transition-colors border-b border-gray-100"
    >
      <td className="p-2 w-12">
        <div className="flex items-center gap-2 pl-6">
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </div>
      </td>
      <td className="p-2" colSpan={5}>
        <div className="flex items-center gap-3 pl-6">
          <motion.button
            onClick={onToggle}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </motion.div>
          </motion.button>
          <Package className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-800">{subGroup.name}</span>
          <span className="text-xs text-gray-500">({subGroup.items.length} items)</span>
        </div>
      </td>
      <td className="p-2 w-12"></td>
    </motion.tr>
  );
};

const ItemRow: React.FC<{
  item: InventoryItem;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ item, isSelected, onSelect }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white hover:bg-gray-50 transition-colors border-b border-gray-100"
    >
      <td className="p-3 w-12">
        <div className="flex items-center gap-2 pl-12">
          <div className="flex items-center gap-1 text-gray-300">
            <div className="flex flex-col gap-0.5">
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
          <Checkbox checked={isSelected} onCheckedChange={onSelect} />
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 pl-12">
          {item.crateId ? (
            <>
              <span className="text-lg">🗄️</span>
              <span className="font-medium text-gray-900">{item.crateId}</span>
            </>
          ) : (
            <>
              <span className="text-lg">📦</span>
              <span className="text-gray-400">--</span>
            </>
          )}
        </div>
      </td>
      <td className="p-3 text-sm text-gray-700">{item.itemType}</td>
      <td className="p-3 text-sm text-gray-600">{item.batch}</td>
      <td className="p-3 text-sm font-medium text-gray-900">{item.units}</td>
      <td className="p-3 text-sm text-gray-600">{item.size}</td>
      <td className="p-3 w-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Label</DropdownMenuItem>
            <DropdownMenuItem>Pack</DropdownMenuItem>
            <DropdownMenuItem>Ship</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </motion.tr>
  );
};

export const CollapsibleInventoryTable: React.FC<CollapsibleInventoryTableProps> = ({
  data = [],
}) => {
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());
  const [expandedSubGroups, setExpandedSubGroups] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleLocation = (id: string) => {
    const newExpanded = new Set(expandedLocations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLocations(newExpanded);
  };

  const toggleSubGroup = (id: string) => {
    const newExpanded = new Set(expandedSubGroups);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSubGroups(newExpanded);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                <Checkbox />
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Crate
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Item Type
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Batch
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Units
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="p-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.map((locationGroup) => (
                <React.Fragment key={locationGroup.id}>
                  <LocationGroupRow
                    group={locationGroup}
                    isExpanded={expandedLocations.has(locationGroup.id)}
                    onToggle={() => toggleLocation(locationGroup.id)}
                    isSelected={selectedItems.has(locationGroup.id)}
                    onSelect={() => toggleSelection(locationGroup.id)}
                  />
                  {expandedLocations.has(locationGroup.id) &&
                    locationGroup.subGroups.map((subGroup) => (
                      <React.Fragment key={subGroup.id}>
                        <SubGroupRow
                          subGroup={subGroup}
                          isExpanded={expandedSubGroups.has(subGroup.id)}
                          onToggle={() => toggleSubGroup(subGroup.id)}
                          isSelected={selectedItems.has(subGroup.id)}
                          onSelect={() => toggleSelection(subGroup.id)}
                        />
                        {expandedSubGroups.has(subGroup.id) &&
                          subGroup.items.map((item) => (
                            <ItemRow
                              key={item.id}
                              item={item}
                              isSelected={selectedItems.has(item.id)}
                              onSelect={() => toggleSelection(item.id)}
                            />
                          ))}
                      </React.Fragment>
                    ))}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

