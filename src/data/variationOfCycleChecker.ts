import { DbTricksTableZod } from '../lib/database/schemas/CurrentVersionSchema';
import { z } from 'zod';

type Trick = z.infer<typeof DbTricksTableZod>;

/**
 * Tricks are set up in a way where variationOf defines a "parent" trick they belong to.
 * Important note here is that we do not have trees as a trick can have multiple parents.
 *
 * As such, the set of tricks can be described as a set of disjunct directed cycle-free graphs.
 * This module is responsible for detecting cycles.
 *
 */
export default function buildGraph(tricks: Trick[]) {
  /**
   * This is a "shortcut" map telling us all the roots of a trick. Mainly
   * here to skip doing redundant work. If a path has already been taken, it can be skipped
   */
  const rootsIndex: Record<Trick['id'], Trick['id'][]> = {};

  /**
   * Create a map of child ID -> parent ID for easy lookup
   */
  const childIdToParentIdsLookup: Record<Trick['id'], Trick['id'][]> = {};

  tricks.forEach((trick) => {
    const parents = (trick.variationOf ?? []).map(
      (trickVariationPrimaryKey) => trickVariationPrimaryKey[0]
    );
    childIdToParentIdsLookup[trick.id] = parents;
  });

  // A recursive function that looks at the immediate parent nodes
  function handleTraversal(currentId: number, currentChain: Trick['id'][]): number[] {
    if (childIdToParentIdsLookup[currentId].length === 0) {
      // We found a root!
      // Add this ID as a parent for everything in the chain
      rootsIndex[currentId] = [currentId];
      currentChain.forEach((entryId) => {
        if (!rootsIndex[entryId]) {
          rootsIndex[entryId] = [];
        }
        rootsIndex[entryId].push(currentId);
      });
      return [currentId];
    }
    // Do cycle check
    if (currentChain.includes(currentId)) {
      throw 'Trick cycle detected: ' + [...currentChain, currentId].join(' → ');
    }

    currentChain.push(currentId);
    if (rootsIndex[currentId]) {
      // This ID is known! We can short-track
      const rootIds = rootsIndex[currentId];

      currentChain.forEach((entryId) => (rootsIndex[entryId] = rootIds));
      return [...rootIds];
    }

    const parentIds = childIdToParentIdsLookup[currentId]
      .map((entryId) => handleTraversal(entryId, [...currentChain]))
      .flatMap((e) => e);
    return parentIds;
  }

  // Iterate over every trick and built its "variationOf-Dependency-Graph".
  // If any cycles are found, error.
  tricks.forEach((trick) => {
    // This will throw an Error if a cycle is discovered
    handleTraversal(trick.id, []);
  });
}
