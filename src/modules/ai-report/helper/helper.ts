import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
//for DA and QPDS

const calculateAccuracy = (plannedQty, detectedQty) => {
  return plannedQty === 0 ? 0 : (detectedQty / plannedQty) * 100;
};

const calculateCompliance = (skus) => {
  const planned = skus?.reduce((sum, sku) => sum + (sku?.plannedQty || 0), 0);
  const detected = skus?.reduce((sum, sku) => sum + (sku?.detectedQty || 0), 0);
  return {
    planned,
    detected,
    percentage: planned === 0 ? 0 : Math.round((detected / planned) * 100),
  };
};

export const calculateOverallCompliance = (planograms) => {
  const planogramCompliance = planograms?.reduce(
    (sum, planogram) => sum + (planogram?.compliance || 0),
    0,
  );
  return planograms.length === 0
    ? 0
    : Math.round(planogramCompliance / planograms.length);
};

export const calculatevariantWiseComplianceAvg = (planograms) => {
  const planogramVariantWiseCompliance = planograms?.reduce(
    (sum, planogram) => sum + (planogram?.variantWiseCompliance || 0),
    0,
  );
  return planograms.length === 0
    ? 0
    : Math.round(planogramVariantWiseCompliance / planograms.length);
};

const calculatevariantWiseCompliance = (totalAccuracy, totalSkus) => {
  return totalSkus === 0 ? 0 : Math.round(totalAccuracy / totalSkus);
};

export const processPlanogram = (data) => {
  let tempData = data;
  let totalAccuracy = 0;
  let totalSkus = 0;
  tempData.planogram.forEach((item) => {
    let skuAcc = 0;
    let skuQty = 0;
    item.sku.forEach((sku) => {
      if (sku?.name !== 'Shelf Talker') {
        sku.detectedQty = sku.detectedQty || 0;
        let acc = calculateAccuracy(sku.plannedQty, sku.detectedQty || 0);
        sku.accuracy = acc > 100 ? 100 : acc;
        skuAcc += sku.accuracy;
        skuQty++;
        totalAccuracy += sku.accuracy;
        totalSkus++;
      }
    });
    let filteredSkus = item?.sku?.filter((sku) => sku?.name !== 'Shelf Talker');
    let compliance = calculateCompliance(filteredSkus);
    item.totalPlannedQty = compliance.planned;
    item.totalDetectedQty = compliance.detected;
    item.compliance = compliance.percentage > 100 ? 100 : compliance.percentage;
    item.variantWiseCompliance = calculatevariantWiseCompliance(skuAcc, skuQty);
  });

  tempData.overallCompliance = calculateOverallCompliance(data.planogram);
  tempData.variantWiseCompliance = calculatevariantWiseComplianceAvg(
    data.planogram,
  );
  return tempData;
};

///for  SOS

const calculateTotalItems = (items) => {
  const totalItems = items?.reduce(
    (sum, item) => sum + (item?.quantity || 0),
    0,
  );
  return totalItems;
};

export const processSOS = (data) => {
  let tempData = data;
  if (tempData?.box?.length > 0) {
    tempData.box.forEach((item) => {
      if (item?.sku?.length > 0) {
        let totalItems = calculateTotalItems(item?.sku);
        item?.sku?.forEach((el) => {
          el.sos = totalItems === 0 ? 0 : (el.quantity / totalItems) * 100;
        });
      }
    });
  }
  return tempData;
};

///*******for POSM****///

/*const calculateTotalPOSMUsedItems = (items) => {
  const totalItems = items?.reduce((sum, item) => sum + (item?.qty || 0), 0);
  return totalItems;
};

const calculateTotalPOSMUsedItemsWithoutShelfTalker = (items) => {
  const totalItems = items?.reduce(
    (sum, item) =>
      sum + (item?.category !== 'Shelf Talker' ? item?.qty || 0 : 0),
    0,
  );
  return totalItems;
};

const calculateTotalDetectedItems = (items) => {
  const totalItems = items?.reduce(
    (sum, item) =>
      sum + (item?.category !== 'Shelf Talker' ? item?.detectedQty || 0 : 0),
    0,
  );
  return totalItems;
};*/

/*export const processPOSM = (data) => {
  let tempData = data;
  if (tempData?.material?.length > 0) {
    let totalUsed = calculateTotalPOSMUsedItems(tempData?.material);
    let totalUsedWithoutShelfTalker =
      calculateTotalPOSMUsedItemsWithoutShelfTalker(tempData?.material);
    let totalDetected = calculateTotalDetectedItems(tempData?.material);
    tempData?.material?.forEach((m) => {
      if (m?.category !== 'Shelf Talker') {
        m.accuracy = m?.qty === 0 ? 0 : ((m?.detectedQty || 0) / m?.qty) * 100;
        m.accuracy = m?.accuracy > 100 ? 100 : m.accuracy;
      }
    });
    tempData.totalUsedQty = totalUsed;
    tempData.totalDetectedQty = totalDetected;
    tempData.accuracy =
      totalUsedWithoutShelfTalker === 0
        ? 0
        : (totalDetected / totalUsedWithoutShelfTalker) * 100;
    tempData.accuracy = tempData?.accuracy > 100 ? 100 : tempData.accuracy;
  }
  return tempData;
};*/

const calculateTotalPOSMUsedItems = (items) => {
  let ublItems = items?.filter((it) => it.qty !== null && it.qty >= 0);
  const totalItems = ublItems?.reduce((sum, item) => sum + (item?.qty || 0), 0);
  return totalItems;
};

const calculateTotalPOSMUsedItemsWithoutShelfTalker = (items) => {
  let ublItems = items?.filter((it) => it.qty !== null && it.qty >= 0);
  const totalItems = ublItems?.reduce(
    (sum, item) =>
      sum + (item?.category !== 'Shelf Talker' ? item?.qty || 0 : 0),
    0,
  );
  return totalItems;
};

const calculateTotalDetectedItems = (items) => {
  let ublItems = items?.filter((it) => it.qty !== null && it.qty >= 0);
  const totalItems = ublItems?.reduce(
    (sum, item) =>
      sum + (item?.category !== 'Shelf Talker' ? item?.detectedQty || 0 : 0),
    0,
  );
  return totalItems;
};

export const processPOSM = (data) => {
  let tempData = data;
  tempData['accuracy'] = 0;
  tempData['totalUsedQty'] = 0;
  tempData['totalDetectedQty'] = 0;
  if (tempData?.material?.length > 0) {
    let totalUsed = calculateTotalPOSMUsedItems(tempData?.material);
    let totalUsedWithoutShelfTalker =
      calculateTotalPOSMUsedItemsWithoutShelfTalker(tempData?.material);
    let totalDetected = calculateTotalDetectedItems(tempData?.material);
    tempData?.material?.forEach((m) => {
      if (m?.category !== 'Shelf Talker' && m.id && m.qty !== null) {
        let inputQty = /*m.deployedQty > 0 ? m.deployedQty :*/ m?.qty;
        m.accuracy =
          inputQty === 0
            ? m?.detectedQty > 0
              ? 100
              : 0
            : ((m?.detectedQty || 0) / inputQty) * 100;
        m.accuracy = m?.accuracy > 100 ? 100 : m.accuracy;
      }
    });
    tempData.totalUsedQty = totalUsed;
    tempData.totalDetectedQty = totalDetected;
    tempData.accuracy =
      totalUsedWithoutShelfTalker === 0
        ? totalDetected > 0
          ? 100
          : 0
        : Math.round((totalDetected / totalUsedWithoutShelfTalker) * 100);
    tempData.accuracy = tempData?.accuracy > 100 ? 100 : tempData.accuracy;
  }
  return tempData;
};

export const calculateSOVMStats = (data) => {
  interface DetectedStats {
    detectedQty: number;
    surfaceArea: number;
  }

  let totalSurface = data?.material.reduce(
    (sum, curr) => sum + (curr.detectedQty || 0) * (curr.size || 0),
    0,
  );

  const detectedStats: { [key: string]: DetectedStats } = {};

  data.material.forEach((item) => {
    const type =
      item.competitorType === null || item.competitorType === undefined
        ? 'Unilever Bangladesh'
        : item.competitorType;

    if (!detectedStats[type]) {
      detectedStats[type] = { detectedQty: 0, surfaceArea: 0 };
    }

    detectedStats[type].detectedQty += item.detectedQty || 0;
    detectedStats[type].surfaceArea +=
      (item.detectedQty || 0) * (item.size || 0);
  });

  const totalDetectedQty = Object.values(detectedStats).reduce(
    (sum, stat) => sum + stat.detectedQty,
    0,
  );

  const resultArray = Object.entries(detectedStats).map(
    ([competitorType, stats]) => ({
      type: competitorType,
      presenceCount: stats.detectedQty,
      sovmByCount:
        totalDetectedQty > 0
          ? Math.round((stats.detectedQty / totalDetectedQty) * 100)
          : 0,
      sovmBySurface:
        totalSurface > 0
          ? Math.round((stats.surfaceArea / totalSurface) * 100)
          : 0,
    }),
  );

  return resultArray;
};

///for mt sos

const calculateSkuSizes = (items) => {
  const result = items?.reduce(
    (sum, item) => sum + (item?.detectedQty || 0) * (item?.size || 10),
    0,
  );
  return result;
};

const overAllSkuSizes = (items, label) => {
  let result = 0;
  if (label === 'shelf') {
    result = items?.reduce((sum, item) => sum + (item?.shelfSize || 0), 0);
  } else if (label === 'uniliver') {
    result = items?.reduce((sum, item) => sum + (item?.uniliverSize || 0), 0);
  }
  return result;
};

export const processMTSOS = (data) => {
  let tempData = data;
  tempData.categories.forEach((dt) => {
    const meas = dt.measurements.reduce(
      (meas, { totalShelf, length }) =>
        meas + parseInt(totalShelf) * parseInt(length),
      0,
    );
    dt.shelfSize = meas;
    dt.shelfPercentage = 100;
    let skuSizeTotal = calculateSkuSizes(dt.sku);
    dt.uniliverSize = skuSizeTotal;
    dt.uniliverPercentage =
      dt.shelfSize > 0 ? (dt.uniliverSize / dt.shelfSize) * 100 : 0;
    dt.uniliverPercentage =
      dt.uniliverPercentage > 100 ? 100 : dt.uniliverPercentage;
  });
  tempData.overallShelfSize = overAllSkuSizes(tempData.categories, 'shelf');
  tempData.overallShelfPercentage = 100;
  tempData.overallUniliverSize = overAllSkuSizes(
    tempData.categories,
    'uniliver',
  );
  tempData.overallUniliverPercentage =
    tempData.overallShelfSize > 0
      ? (tempData.overallUniliverSize / tempData.overallShelfSize) * 100
      : 0;
  tempData.overallUniliverPercentage =
    tempData.overallUniliverPercentage > 100
      ? 100
      : tempData.overallUniliverPercentage;
  return tempData;
};

export const processSachetShare = (skuData) => {
  const share = {};

  skuData.forEach((item) => {
    if (item.category === 'N/A') return;

    if (!share[item.category]) {
      share[item.category] = { unilever: 0, competitor: 0 };
    }

    if (item.owner === 'Unilever Bangladesh Limited') {
      share[item.category].unilever += item.totalDetectedQty;
    } else {
      share[item.category].competitor += item.totalDetectedQty;
    }
  });

  const result = [];
  for (const category in share) {
    const total = share[category].unilever + share[category].competitor;
    if (total > 0) {
      result.push({
        category,
        ubl: Math.round((share[category].unilever / total) * 100),
        competitor: Math.round((share[category].competitor / total) * 100),
      });
    }
  }

  let totalUbl = result?.reduce((sum, item) => sum + item.ubl, 0);
  let overallUblShare =
    result?.length > 0 ? Math.round(totalUbl / result.length) : 0;

  return { result, overallUblShare };
};

export const checkOverAllSlotAdherencePassed = (job) => {
  let passed = false;
  let detectedHangerBrands = job?.brandHanger
    ? job.brandHanger.split(', ')
    : [];

  if (detectedHangerBrands.length) {
    let ublSkus = job?.sku?.filter(
      (sku) => sku.owner === 'Unilever Bangladesh Limited',
    );
    if (ublSkus?.length > 0) {
      passed = ublSkus.every((item) => {
        return (
          detectedHangerBrands
            .map((brand) => brand.toLowerCase())
            .includes(item.brand?.toLowerCase()) &&
          item.slot === 'Yes' &&
          item.orientation === 'Yes'
        );
      });
    }
  }
  return { overAllSlotAdherencePassed: passed };
};

export const processSOSShare = (data, categoryWiseSosFloor) => {
  const categoryWiseSosFloorMap = categoryWiseSosFloor?.reduce(
    (map, { productCategory, percentage }) => {
      map[productCategory] = percentage;
      return map;
    },
    {},
  );

  const output = data.map(({ category, sku }) => {
    const totalQuantity = sku.reduce((sum, { quantity }) => sum + quantity, 0);
    const ublQuantity = sku
      .filter(({ owner }) => owner === 'Unilever Bangladesh Limited')
      .reduce((sum, { quantity }) => sum + quantity, 0);

    const competitorQuantity = totalQuantity - ublQuantity;

    const ublPercentage =
      totalQuantity > 0 ? Math.round((ublQuantity / totalQuantity) * 100) : 0;
    const competitorPercentage =
      totalQuantity > 0
        ? Math.round((competitorQuantity / totalQuantity) * 100)
        : 0;

    return {
      category,
      ubl: ublPercentage,
      competitor: competitorPercentage,
      floor: categoryWiseSosFloorMap[category],
      passed: ublPercentage >= categoryWiseSosFloorMap[category] ? true : false,
    };
  });

  let categoryWiseSosPassed =
    output?.length > 0
      ? output.find((i) => i.passed === false)
        ? false
        : true
      : null;

  return { output, categoryWiseSosPassed };
};

export const applyShelvingNorm = (inputData, shelvingNormThreshold) => {
  const shelvingNormMap = shelvingNormThreshold?.reduce(
    (map, { productBrand, quantity }) => {
      map[productBrand] = quantity;
      return map;
    },
    {},
  );

  inputData.box.forEach((item) => {
    item.sku = item.sku.map((sku) => {
      if (
        sku.owner === 'Unilever Bangladesh Limited' &&
        shelvingNormMap[sku.brand] !== undefined
      ) {
        return {
          ...sku,
          minQty: shelvingNormMap[sku.brand],
          shelvingNorm:
            sku.quantity >= shelvingNormMap[sku.brand] ? 'Yes' : 'No',
        };
      }
      return { ...sku, minQty: 'N/A', shelvingNorm: 'N/A' };
    });
  });

  inputData?.box?.forEach((item) => {
    let existMinQty = item?.sku?.find((i) => i.minQty !== 'N/A');
    if (!existMinQty) {
      item.passedNorm = null;
    } else {
      let shelvingNormWithNo = item?.sku?.find(
        (i) => i.minQty !== 'N/A' && i.shelvingNorm === 'No',
      );
      item.passedNorm = shelvingNormWithNo ? false : true;
    }
  });
  let passedNormNotNull = inputData?.box?.find((i) => i.passedNorm !== null);
  let overallPassedNorm = null;
  if (passedNormNotNull) {
    overallPassedNorm = inputData?.box?.find((i) => i.passedNorm === false)
      ? false
      : true;
  }
  return { inputData, overallPassedNorm };
};

export const processMaterialsFromArray = (data) => {
  const materialMap = {};

  data.forEach((material) => {
    const { materialId, qty, detectedQty, createdAt } = material;

    const materialIdStr = materialId.toString();

    if (!materialMap[materialIdStr]) {
      materialMap[materialIdStr] = {
        materialId,
        firstCreatedAt: qty > 0 ? createdAt : null,
        lastDetectedAt: detectedQty > 0 ? createdAt : null,
        maxQty: qty,
      };
    } else {
      const current = materialMap[materialIdStr];
      if (
        qty > 0 &&
        (!current.firstCreatedAt ||
          new Date(createdAt) < new Date(current.firstCreatedAt))
      ) {
        current.firstCreatedAt = createdAt;
      }

      if (qty >= 0 && detectedQty > 0) {
        if (
          !current.lastDetectedAt ||
          new Date(createdAt) > new Date(current.lastDetectedAt)
        ) {
          current.lastDetectedAt = createdAt;
        }
      }

      current.maxQty = Math.max(current.maxQty, qty);
    }
  });

  return Object.values(materialMap).map((material: any) => {
    if (material.firstCreatedAt && material.lastDetectedAt) {
      const dayDiff = dayjs(material.lastDetectedAt).diff(
        dayjs(material.firstCreatedAt),
        'day',
      );
      material.dayDiff = dayDiff;
    } else {
      material.dayDiff = 0;
    }
    return material;
  });
};
