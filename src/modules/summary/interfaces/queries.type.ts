export interface GetTownSummaryQuery {
    towncode?: string;
    materialName?: string;
    dateRange?: string;
    page?: number;
    limit?: number;
}

export interface GetUserSummaryQuery {
    towncode?: string;
    userType?: string;
    usercode?: string;
    materialName?: string;
    dateRange?: string;
    page?: number;
    limit?: number;
}