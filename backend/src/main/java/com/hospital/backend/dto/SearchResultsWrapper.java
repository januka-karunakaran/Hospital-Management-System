package com.hospital.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Generic wrapper for paginated search results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultsWrapper<T> {
    private List<T> data;
    private Integer totalCount;
    private Integer limit;
    private Integer offset;
    private Integer pageNumber;
    private Integer totalPages;
    private Boolean hasMore;
}
